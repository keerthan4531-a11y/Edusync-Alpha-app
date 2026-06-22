/**
 * turbo-race.ts — Multi-Model Concurrent Race Engine
 * 
 * Fires requests to ALL frontier + mid-high tier models simultaneously.
 * First response wins → all others are cancelled immediately.
 * 
 * Phase 1: Direct IP (fastest path, no proxy overhead)
 * Phase 2: Proxy race (only when direct IP hits rate limits)
 * 
 * This module is used ONLY for question/challenge generation
 * where speed matters more than model selection.
 */

import { createChatCompletion } from './g4f-client';
import { sanitizeResponse } from './ai-obfuscator';
import { getInixaDisplayName } from './ai-obfuscator';
import type { INIXAResponse, INIXAMessage } from './inixa-ai';

// ═══════════════════════════════════════════════════════════════════
// Race Model Tiers — Curated for speed + reliability
// ═══════════════════════════════════════════════════════════════════

interface RaceModel {
  id: string;           // AI_MODELS id
  label: string;        // Human label for logs
  tier: 'frontier' | 'mid-high' | 'direct-api' | 'fast';
  timeout: number;      // Per-model timeout in ms
}

/**
 * Models selected for the race — balanced across providers for maximum hit rate.
 * We pick ~16 models across different providers/servers so even if one provider
 * is down, others will respond.
 * 
 * Provider diversity:
 * - Pollinations (3 models)
 * - Nvidia (3 models)  
 * - Gemini v1beta (2 models)
 * - Groq (2 models)
 * - CrowLLM (1 model)
 * - Cloudflare (1 model)
 * - Direct APIs: Pollinations, LLM7 (2 models)
 */
const RACE_MODELS: RaceModel[] = [
  // ── Gemini Models (Not Gemma) ──
  { id: 'g4f-gemini-3.1-flash-lite-v1beta', label: 'Gemini 3.1 Flash-Lite', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-gemini-3.1-flash-lite-preview-v1beta', label: 'Gemini 3.1 Preview', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-gemini-2.5-flash-v1beta', label: 'Gemini 2.5 Flash', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-gemini-2.5-flash-lite-v1beta', label: 'Gemini 2.5 Flash-Lite', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-gemini-flash-lite-latest-v1beta', label: 'Gemini Flash-Lite Latest', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-gemini-3.5-flash-v1beta', label: 'Gemini 3.5 Flash', tier: 'frontier', timeout: 45000 },

  // ── Grok Models ──
  { id: 'g4f-grok-4-pollinations', label: 'Grok 4 (Pollinations)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-grok', label: 'Grok (Proxy Pool)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-grok-4.3-crowllm', label: 'Grok 4.3 (CrowLLM)', tier: 'frontier', timeout: 45000 },

  // ── DeepSeek Frontier Models ──
  { id: 'g4f-deepseek-v4-flash-nvidia', label: 'DeepSeek V4 Flash (Nv)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-deepseek-v4-pro-nvidia', label: 'DeepSeek V4 Pro (Nv)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-deepseek-v3.2', label: 'DeepSeek V3.2', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-deepseek-v4-pro', label: 'DeepSeek V4 Pro', tier: 'frontier', timeout: 45000 },

  // ── Kimi Models ──
  { id: 'g4f-kimi-k2.6-nvidia', label: 'Kimi k2.6 (Nv)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-kimi-k2.6', label: 'Kimi k2.6 (Proxy Pool)', tier: 'frontier', timeout: 45000 },

  // ── Mistral & Large Llama Models (>50B) ──
  { id: 'g4f-mistral-large-675b', label: 'Mistral Large 675B (Nv)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-mistral-small-119b',                   label: 'Mistral Small 119B (Nv)', tier: 'frontier', timeout: 45000 },
  { id: 'g4f-llama-3.3-70b-groq',                   label: 'Llama 3.3 70B (Groq)',    tier: 'frontier', timeout: 45000 },
  { id: 'g4f-llama-3.3-70b-nvidia',                 label: 'Llama 3.3 70B (Nv)',      tier: 'frontier', timeout: 45000 },
  { id: 'g4f-nemotron-super-120b-nvidia',           label: 'Nemotron 120B (Nv)',      tier: 'frontier', timeout: 45000 },
  { id: 'g4f-nemotron-super-openrouter',            label: 'Nemotron 120B (OpenR)',   tier: 'frontier', timeout: 45000 },
];

// Fallbacks for Phase 2 if everything in Phase 1 fails (Direct APIs)
const PROXY_RACE_MODEL_IDS = [
  'pollination-gptoss',
  'llm7-models'
];

// ── Champion Caching ──
// To prevent burning tokens/rate limits across multiple sequential queries
// we cache the winning model for a short time and try it first.
let cachedChampionId: string | null = null;
let cachedChampionExpiry: number = 0;
const CHAMPION_TTL_MS = 60000; // 1 minute

// ═══════════════════════════════════════════════════════════════════
// Turbo Race Engine
// ═══════════════════════════════════════════════════════════════════

/**
 * Race all models concurrently. First valid response wins.
 * 
 * Strategy:
 * 1. Fire ALL race models simultaneously with individual AbortControllers
 * 2. Promise.any() picks the first success
 * 3. Winner aborts all other in-flight requests
 * 4. If all fail → returns null (caller should try proxy phase)
 */
async function raceModels(
  models: RaceModel[],
  messages: INIXAMessage[],
  temperature: number,
  parentSignal?: AbortSignal
): Promise<{ response: string; modelId: string; modelLabel: string; responseTime: number } | null> {
  const startTime = Date.now();
  const controllers = models.map(() => new AbortController());

  // If parent aborts, abort all children
  if (parentSignal) {
    parentSignal.addEventListener('abort', () => {
      controllers.forEach(ctrl => ctrl.abort());
    });
  }

  const racePromises = models.map((model, index) => {
    const controller = controllers[index];

    // Per-model timeout
    const timeoutId = setTimeout(() => controller.abort(), model.timeout);

    return (async () => {
      try {
        const result = await createChatCompletion(
          {
            model: model.id,
            messages,
            temperature,
            stream: false,
          },
          false, // Don't use proxy in Phase 1
          undefined,
          controller.signal
        );

        clearTimeout(timeoutId);

        const content = result.choices?.[0]?.message?.content || '';
        if (!content || content.length < 10) {
          throw new Error(`Empty or too-short response from ${model.label}`);
        }

        // Validate JSON since all Turbo callers expect JSON
        try {
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
          JSON.parse(jsonString); // Will throw if invalid
        } catch (e) {
          throw new Error(`Invalid JSON format from ${model.label}`);
        }

        const responseTime = Date.now() - startTime;
        console.log(`[TurboRace] 🏆 WINNER: ${model.label} responded in ${responseTime}ms (${content.length} chars)`);

        return {
          response: content,
          modelId: model.id,
          modelLabel: model.label,
          responseTime,
          winnerIndex: index,
        };
      } catch (error: any) {
        clearTimeout(timeoutId);

        // Don't log abort errors (they're expected when another model wins)
        if (error.name !== 'AbortError') {
          const isRateLimit = error.message?.includes('429') || error.message?.includes('rate_limit');
          const emoji = isRateLimit ? '⏱️' : '❌';
          console.warn(`[TurboRace] ${emoji} ${model.label} failed: ${error.message?.substring(0, 80)}`);
        }
        throw error;
      }
    })();
  });

  try {
    const winner: any = await Promise.any(racePromises);

    // Abort all other in-flight requests immediately
    controllers.forEach((ctrl, idx) => {
      if (idx !== winner.winnerIndex) {
        ctrl.abort();
      }
    });

    return {
      response: winner.response,
      modelId: winner.modelId,
      modelLabel: winner.modelLabel,
      responseTime: winner.responseTime,
    };
  } catch (aggregateError: any) {
    // All promises rejected
    const errorCount = aggregateError.errors?.length || 'unknown';
    console.error(`[TurboRace] 💀 ALL ${errorCount} models failed in Phase`);

    // Cleanup
    controllers.forEach(ctrl => ctrl.abort());
    return null;
  }
}

/**
 * Main turbo race function — the public API
 * 
 * Phase 1: Race all models with direct IP (fastest)
 * Phase 2: If Phase 1 fails, race subset through proxy  
 * Phase 3: If both fail, return error
 */
export async function turboRace(
  messages: INIXAMessage[],
  temperature: number = 0.7,
  signal?: AbortSignal
): Promise<INIXAResponse> {
  const overallStart = Date.now();

  // ── Phase 0: Champion Race (Save requests) ──
  if (cachedChampionId && Date.now() < cachedChampionExpiry) {
    const championModel = RACE_MODELS.find(m => m.id === cachedChampionId);
    if (championModel) {
      console.log(`[TurboRace] 🏆 Racing cached champion first: ${championModel.label}`);
      
      // We give the champion a short timeout so we don't stall too long if it randomly died
      const championPhaseModel = { ...championModel, timeout: 8000 };
      const phase0Result = await raceModels([championPhaseModel], messages, temperature, signal);

      if (phase0Result) {
        const sanitized = sanitizeResponse(phase0Result.response);
        console.log(`[TurboRace] ✅ Champion responded in ${phase0Result.responseTime}ms. Saved 15 requests!`);
        
        // Refresh TTL
        cachedChampionExpiry = Date.now() + CHAMPION_TTL_MS;

        return {
          success: true,
          response: sanitized,
          modelUsed: phase0Result.modelLabel,
          responseTime: phase0Result.responseTime,
        };
      } else {
        console.log(`[TurboRace] ⚠️ Champion failed or timed out. Falling back to full Phase 1 race.`);
        cachedChampionId = null; // Invalidate
      }
    }
  }

  console.log(`[TurboRace] 🚀 Starting race with ${RACE_MODELS.length} models across ${new Set(RACE_MODELS.map(m => m.tier)).size} tiers`);

  // ── Phase 1: Direct IP Race ──
  const phase1Result = await raceModels(RACE_MODELS, messages, temperature, signal);

  if (phase1Result) {
    const sanitized = sanitizeResponse(phase1Result.response);
    console.log(`[TurboRace] ✅ Phase 1 complete: ${phase1Result.modelLabel} in ${phase1Result.responseTime}ms`);
    
    // Set as new champion
    cachedChampionId = phase1Result.modelId;
    cachedChampionExpiry = Date.now() + CHAMPION_TTL_MS;

    return {
      success: true,
      response: sanitized,
      modelUsed: phase1Result.modelLabel,
      responseTime: phase1Result.responseTime,
    };
  }

  // ── Phase 2: Proxy Race (subset of models through proxy pool) ──
  console.log(`[TurboRace] ⚡ Phase 1 failed. Starting Phase 2 (Proxy Race) with ${PROXY_RACE_MODEL_IDS.length} models...`);

  const proxyModels: RaceModel[] = PROXY_RACE_MODEL_IDS.map(id => {
    let label = id;
    if (id === 'pollination-gptoss') label = 'Pollinations Direct';
    if (id === 'llm7-models') label = 'LLM7 Direct';

    return {
      id,
      label,
      tier: 'direct-api' as const,
      timeout: 45000, // Longer timeout to ensure fallback completes
    };
  });

  const phase2Result = await raceModels(proxyModels, messages, temperature, signal);

  if (phase2Result) {
    const sanitized = sanitizeResponse(phase2Result.response);
    const totalTime = Date.now() - overallStart;
    console.log(`[TurboRace] ✅ Phase 2 complete: ${phase2Result.modelLabel} in ${totalTime}ms total`);

    return {
      success: true,
      response: sanitized,
      modelUsed: getInixaDisplayName(phase2Result.modelId),
      responseTime: totalTime,
    };
  }

  // ── Phase 3: Everything failed ──
  const totalTime = Date.now() - overallStart;
  console.error(`[TurboRace] 💀 ALL phases failed after ${totalTime}ms`);

  return {
    success: false,
    response: 'I apologize, but INIXA AI is temporarily experiencing high demand. Please try again in a moment.',
    modelUsed: 'INIXA AI',
    responseTime: totalTime,
    error: 'All turbo race models failed across both phases.',
  };
}

/**
 * Get info about the race configuration (for admin/debug)
 */
export function getTurboRaceInfo() {
  const tiers = new Map<string, number>();
  RACE_MODELS.forEach(m => {
    tiers.set(m.tier, (tiers.get(m.tier) || 0) + 1);
  });

  return {
    totalModels: RACE_MODELS.length,
    proxyFallbackModels: PROXY_RACE_MODEL_IDS.length,
    tiers: Object.fromEntries(tiers),
    models: RACE_MODELS.map(m => ({ id: m.id, label: m.label, tier: m.tier, timeout: m.timeout })),
  };
}
