/**
 * g4f-client.ts — Server-side only g4f.dev client wrapper
 * 
 * This file is the ONLY place that imports or references g4f.dev directly.
 * It is NEVER imported in client components — only in API routes & server libs.
 * All model names and provider details are abstracted away from the user.
 */

import { HttpsProxyAgent } from 'https-proxy-agent';
import { getProxyUrl } from './proxy-manager';

// g4f.dev API base URL — configurable from admin settings
const G4F_BASE_URL = process.env.G4F_BASE_URL || 'https://g4f.dev';

interface G4FMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface G4FCompletionRequest {
  model: string;
  messages: G4FMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface G4FCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface G4FModel {
  id: string;
  object: string;
  owned_by?: string;
  capabilities?: string[];
}

/**
 * Create a chat completion request to g4f.dev
 * Uses OpenAI-compatible API format
 */
import { AI_MODELS } from '@/api/aiEngine';

export async function createChatCompletion(
  request: G4FCompletionRequest,
  useProxy: boolean = true,
  baseUrl?: string
): Promise<G4FCompletionResponse> {
  const modelStr = request.model;
  
  // Resolve model ID to modelStr if it is a friendly ID
  const foundModel = AI_MODELS.find(m => m.id === modelStr);
  const resolvedModel = foundModel ? foundModel.modelStr : modelStr;
  const engine = foundModel?.engine || 'g4f';
  
  if (engine === 'pollinations') {
    // Direct server-side request to Pollinations.ai (OpenAI compatible endpoint)
    // The user's IP is not exposed, request goes through our backend
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: resolvedModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
      }),
    };
    
    try {
      const response = await fetch('https://text.pollinations.ai/openai', fetchOptions);
      if (!response.ok) {
        throw new Error(`Pollinations API failed (${response.status})`);
      }
      const text = await response.text();
      // Pollinations might return direct text or JSON. We check if it's JSON.
      try {
        const json = JSON.parse(text);
        if (json.choices) return json as G4FCompletionResponse;
      } catch (e) {
        // Fallback if it returned raw text
        return {
          id: `pollinations-${Date.now()}`,
          model: resolvedModel,
          choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
        };
      }
      // If parsed JSON doesn't have choices, fallback to text
      return {
          id: `pollinations-${Date.now()}`,
          model: resolvedModel,
          choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
      };
    } catch (e: any) {
      throw new Error(`Pollinations API Error: ${e.message}`);
    }
  }
  
  if (engine === 'llm7') {
    // Direct server-side request to LLM7.io proxy
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: resolvedModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
      }),
    };
    
    try {
      // Assuming LLM7.io proxy endpoint is OpenAI compatible
      const response = await fetch('https://api.llm7.io/v1/chat/completions', fetchOptions);
      if (!response.ok) {
        throw new Error(`LLM7 API failed (${response.status})`);
      }
      const data = await response.json();
      return data as G4FCompletionResponse;
    } catch (e: any) {
      throw new Error(`LLM7 API Error: ${e.message}`);
    }
  }

  const isG4F = resolvedModel.startsWith('g4f/') || resolvedModel.startsWith('deepinfra/') || resolvedModel.startsWith('qwen_worker/');
  
  const port = process.env.PORT || '3000';
  const url = isG4F 
    ? `http://127.0.0.1:${port}/api/chat/g4f` 
    : `http://127.0.0.1:${port}/api/chat/completions`;

  const secureHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': `http://127.0.0.1:${port}`,
    'Referer': `http://127.0.0.1:${port}/`,
  };

  if (process.env.INIXA_PROXY_SECRET) {
    secureHeaders['Authorization'] = `Bearer ${process.env.INIXA_PROXY_SECRET}`;
  }

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: secureHeaders,
    body: JSON.stringify({
      model: resolvedModel,
      messages: request.messages,
      stream: false,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 4096,
    }),
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Model request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data as G4FCompletionResponse;
}

/**
 * Fetch available models from g4f.dev
 */
export async function fetchAvailableModels(baseUrl?: string): Promise<G4FModel[]> {
  try {
    const url = `${baseUrl || G4F_BASE_URL}/v1/models`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || data) as G4FModel[];
  } catch (error) {
    console.error('[INIXA] Failed to fetch models from provider:', error);
    // Return a hardcoded fallback list of known working models
    return getKnownModels();
  }
}

/**
 * Test if a specific model is responding
 */
export async function testModelHealth(
  modelId: string,
  baseUrl?: string
): Promise<{ alive: boolean; latency: number; error?: string }> {
  const startTime = Date.now();
  try {
    const result = await createChatCompletion(
      {
        model: modelId,
        messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
        max_tokens: 10,
        temperature: 0,
      },
      false, // Don't use proxy for health checks
      baseUrl
    );

    const latency = Date.now() - startTime;
    const hasContent = result.choices?.[0]?.message?.content?.length > 0;

    return {
      alive: hasContent,
      latency,
    };
  } catch (error: any) {
    return {
      alive: false,
      latency: Date.now() - startTime,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Known working models — used as fallback when live model list fails
 * Categorized by provider family
 */
export function getKnownModels(): G4FModel[] {
  return [
    // Gemini family
    { id: 'gemini-2.5-flash', object: 'model', owned_by: 'google' },
    { id: 'gemini-2.0-flash', object: 'model', owned_by: 'google' },
    { id: 'gemini-pro', object: 'model', owned_by: 'google' },
    // GPT family
    { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
    { id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
    { id: 'gpt-4.1', object: 'model', owned_by: 'openai' },
    { id: 'gpt-4.1-mini', object: 'model', owned_by: 'openai' },
    // Claude family
    { id: 'claude-sonnet-4', object: 'model', owned_by: 'anthropic' },
    { id: 'claude-3.5-sonnet', object: 'model', owned_by: 'anthropic' },
    // Grok family
    { id: 'grok-3', object: 'model', owned_by: 'xai' },
    { id: 'grok-3-mini', object: 'model', owned_by: 'xai' },
    // DeepSeek family
    { id: 'deepseek-v3', object: 'model', owned_by: 'deepseek' },
    { id: 'deepseek-r1', object: 'model', owned_by: 'deepseek' },
    // Nvidia family
    { id: 'nemotron-70b', object: 'model', owned_by: 'nvidia' },
    // Llama family
    { id: 'llama-3.3-70b', object: 'model', owned_by: 'meta' },
    { id: 'llama-4-maverick', object: 'model', owned_by: 'meta' },
    // MiniMax family
    { id: 'MiniMax-M1', object: 'model', owned_by: 'minimax' },
    // Qwen family
    { id: 'qwen-2.5-72b', object: 'model', owned_by: 'alibaba' },
    { id: 'qwq-32b', object: 'model', owned_by: 'alibaba' },
    // Mistral family
    { id: 'mistral-large', object: 'model', owned_by: 'mistral' },
  ];
}

/**
 * Get model families for admin UI categorization
 */
export function getModelFamilies(): Record<string, string> {
  return {
    google: 'Gemini',
    openai: 'GPT',
    anthropic: 'Claude',
    xai: 'Grok',
    deepseek: 'DeepSeek',
    nvidia: 'Nvidia',
    meta: 'Llama',
    minimax: 'MiniMax',
    alibaba: 'Qwen',
    mistral: 'Mistral',
  };
}
