/**
 * inixa-ai.ts — The unified INIXA AI Gateway
 * 
 * ALL AI requests in the entire EduSync app go through this gateway.
 * It handles:
 * - Reading model config from database (which model for which stage/role)
 * - Fallback chain (primary → fallback1 → ... → fallback5)
 * - Proxy rotation per request
 * - Request logging for admin monitoring
 * - Response sanitization (hide g4f traces)
 */

import { db } from './db';
import { createChatCompletion, fetchAvailableModels, testModelHealth, getKnownModels } from './g4f-client';
import { sanitizeResponse, getSanitizedHeaders, getInixaDisplayName } from './ai-obfuscator';
import { getProxyUrl, reportProxyFailure, reportProxySuccess } from './proxy-manager';
import { turboRace } from './turbo-race';

export interface INIXAContext {
  stage: string;        // "stage-1", "stage-2", "stage-3", "stage-4", "general"
  feature: string;      // "chat", "code-review", "writing-grade", "mock-interview", "resume-scorer", "idea-gen"
  role?: string;        // "STUDENT", "FACULTY", "HOD" — defaults to "ALL"
  userId?: string;      // For logging
}

export interface INIXAMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface INIXAResponse {
  success: boolean;
  response: string;
  modelUsed: string;         // INIXA display name (not real model ID)
  responseTime: number;      // ms
  error?: string;
}

// Default models to use when no config exists
const DEFAULT_PRIMARY_MODEL = 'gemini-3.5-flash';
const DEFAULT_FALLBACK_MODELS = [
  'di-mimo-v2.5-pro',
  'g4f-kimi-k2.6',
  'g4f-grok',
  'g4f-gemini-3-flash-preview',
  'ddg-gpt-4o-mini',
];

/**
 * Main AI gateway function — generates a response using configured models
 * with automatic fallback chain
 */
export async function generateResponse(
  messages: INIXAMessage[],
  context: INIXAContext,
  temperature?: number
): Promise<INIXAResponse> {
  const startTime = Date.now();
  const role = context.role || 'ALL';

  // 1. Get model configuration from database
  const modelChain = await getModelChain(context.stage, role, context.feature);

  // Helper to execute a single model request
  const runModel = async (modelId: string, signal?: AbortSignal): Promise<INIXAResponse> => {
    const reqStartTime = Date.now();
    try {
      const result = await createChatCompletion(
        {
          model: modelId,
          messages,
          temperature,
        },
        true, // Use proxy
        undefined,
        signal
      );

      const responseTime = Date.now() - reqStartTime;
      const rawResponse = result.choices?.[0]?.message?.content || '';
      const sanitizedResponse = sanitizeResponse(rawResponse);

      // Log successful request
      await logRequest({
        userId: context.userId || 'anonymous',
        stage: context.stage,
        feature: context.feature,
        modelUsed: modelId,
        promptTokens: result.usage?.prompt_tokens || 0,
        responseTime,
        success: true,
      });

      return {
        success: true,
        response: sanitizedResponse,
        modelUsed: getInixaDisplayName(modelId),
        responseTime,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      console.warn(`[INIXA] Model ${modelId} failed: ${errorMessage}`);

      // Log failed attempt
      await logRequest({
        userId: context.userId || 'anonymous',
        stage: context.stage,
        feature: context.feature,
        modelUsed: modelId,
        responseTime: Date.now() - reqStartTime,
        success: false,
        errorMessage,
      }).catch(() => {}); // Don't fail on logging errors

      throw error; // Throw so Promise.any knows it failed
    }
  };

  const primaryControllers = modelChain.map(() => new AbortController());

  try {
    // 2. Race all primary configured models concurrently
    const primaryPromises = modelChain.map((modelId, index) => runModel(modelId, primaryControllers[index].signal));
    const winner = await Promise.any(primaryPromises);
    
    // Abort other running primary fetches
    primaryControllers.forEach((ctrl) => ctrl.abort());
    return winner;
  } catch (primaryAggregateError) {
    // Cleanup any lingering primary requests
    primaryControllers.forEach((ctrl) => ctrl.abort());

    console.warn(`[INIXA] All primary models failed. Falling back to Pollinations and LLM7...`);
    
    // 3. Fallback race between direct API providers
    const fallbackModels = ['pollination-gptoss', 'llm7-models'];
    const fallbackControllers = fallbackModels.map(() => new AbortController());
    
    try {
      const fallbackPromises = fallbackModels.map((modelId, index) => runModel(modelId, fallbackControllers[index].signal));
      const winner = await Promise.any(fallbackPromises);
      
      // Abort other running fallback fetches
      fallbackControllers.forEach((ctrl) => ctrl.abort());
      return winner;
    } catch (fallbackAggregateError) {
      // Cleanup lingering fallback requests
      fallbackControllers.forEach((ctrl) => ctrl.abort());

      // 4. Everything failed
      return {
        success: false,
        response: 'I apologize, but INIXA AI is temporarily experiencing high demand. Please try again in a moment.',
        modelUsed: 'INIXA AI',
        responseTime: Date.now() - startTime,
        error: `All configured and fallback models failed.`,
      };
    }
  }
}

/**
 * Test a specific model (for admin playground)
 */
export async function testModel(
  modelId: string,
  prompt: string,
  systemPrompt?: string
): Promise<INIXAResponse> {
  const startTime = Date.now();
  const messages: INIXAMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const result = await createChatCompletion(
      {
        model: modelId,
        messages,
      },
      false // Don't use proxy for admin tests
    );

    return {
      success: true,
      response: result.choices?.[0]?.message?.content || '',
      modelUsed: modelId,
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      response: '',
      modelUsed: modelId,
      responseTime: Date.now() - startTime,
      error: error.message || 'Model test failed',
    };
  }
}

/**
 * Get available models for admin selection
 */
export async function getAvailableModels() {
  return await fetchAvailableModels();
}

/**
 * Check health of a specific model
 */
export async function checkModelHealth(modelId: string) {
  return await testModelHealth(modelId);
}

/**
 * Get the model chain (primary + fallbacks) for a given context
 */
async function getModelChain(
  stage: string,
  role: string,
  feature: string
): Promise<string[]> {
  try {
    // Try exact match first
    let config = await db.aIModelConfig.findFirst({
      where: {
        stage,
        role,
        feature,
        isActive: true,
      },
    });

    // Fallback to "ALL" role if specific role not found
    if (!config && role !== 'ALL') {
      config = await db.aIModelConfig.findFirst({
        where: {
          stage,
          role: 'ALL',
          feature,
          isActive: true,
        },
      });
    }

    // Fallback to "general" stage if specific stage not found
    if (!config) {
      config = await db.aIModelConfig.findFirst({
        where: {
          stage: 'general',
          role: 'ALL',
          feature,
          isActive: true,
        },
      });
    }

    if (config) {
      const chain = [config.primaryModel];
      if (config.fallback1) chain.push(config.fallback1);
      if (config.fallback2) chain.push(config.fallback2);
      if (config.fallback3) chain.push(config.fallback3);
      if (config.fallback4) chain.push(config.fallback4);
      if (config.fallback5) chain.push(config.fallback5);
      return chain;
    }
  } catch (error) {
    console.warn('[INIXA] Failed to fetch model config from DB:', error);
  }

  // Default chain if no config found
  return [DEFAULT_PRIMARY_MODEL, ...DEFAULT_FALLBACK_MODELS];
}

/**
 * Log an AI request to the database
 */
async function logRequest(data: {
  userId: string;
  stage: string;
  feature: string;
  modelUsed: string;
  promptTokens?: number;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  proxyUsed?: string;
}): Promise<void> {
  try {
    await db.aIRequestLog.create({
      data: {
        userId: data.userId,
        stage: data.stage,
        feature: data.feature,
        modelUsed: data.modelUsed,
        promptTokens: data.promptTokens || 0,
        responseTime: data.responseTime,
        success: data.success,
        errorMessage: data.errorMessage,
        proxyUsed: data.proxyUsed,
      },
    });
  } catch (error) {
    // Silently fail logging — don't break the actual AI request
    console.error('[INIXA] Failed to log request:', error);
  }
}

/**
 * TURBO: Generate response using multi-model race engine
 * 
 * Fires requests to ~16 models concurrently — first response wins.
 * Use this for question/challenge generation where speed > model selection.
 * Falls back to proxy race if direct IP hits rate limits.
 */
export async function generateResponseTurbo(
  messages: INIXAMessage[],
  context: INIXAContext,
  temperature?: number
): Promise<INIXAResponse> {
  const startTime = Date.now();

  console.log(`[INIXA-TURBO] 🚀 Turbo race for ${context.stage}/${context.feature} (user: ${context.userId || 'anon'})`);

  const result = await turboRace(messages, temperature, undefined);

  // Log the turbo request
  await logRequest({
    userId: context.userId || 'anonymous',
    stage: context.stage,
    feature: context.feature,
    modelUsed: `turbo:${result.modelUsed}`,
    responseTime: result.responseTime,
    success: result.success,
    errorMessage: result.error,
  }).catch(() => {}); // Don't fail on logging errors

  if (result.success) {
    console.log(`[INIXA-TURBO] ✅ Done in ${result.responseTime}ms via ${result.modelUsed}`);
  } else {
    console.error(`[INIXA-TURBO] ❌ Failed after ${result.responseTime}ms`);
  }

  return result;
}

/**
 * Get AI request statistics (for admin dashboard)
 */
export async function getAIStats(timeRange?: { start: Date; end: Date }) {
  const where = timeRange
    ? { createdAt: { gte: timeRange.start, lte: timeRange.end } }
    : {};

  const [totalRequests, successfulRequests, logs] = await Promise.all([
    db.aIRequestLog.count({ where }),
    db.aIRequestLog.count({ where: { ...where, success: true } }),
    db.aIRequestLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        modelUsed: true,
        responseTime: true,
        success: true,
        createdAt: true,
        feature: true,
        stage: true,
      },
    }),
  ]);

  const avgResponseTime =
    logs.length > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.responseTime, 0) / logs.length)
      : 0;

  // Count by model
  const modelCounts: Record<string, number> = {};
  for (const log of logs) {
    modelCounts[log.modelUsed] = (modelCounts[log.modelUsed] || 0) + 1;
  }

  return {
    totalRequests,
    successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100,
    avgResponseTime,
    modelUsage: modelCounts,
    recentLogs: logs,
  };
}
