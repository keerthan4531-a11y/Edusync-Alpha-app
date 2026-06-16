/**
 * ai-obfuscator.ts — Security layer to hide g4f usage
 * 
 * Strips any g4f/gpt4free references from responses, sanitizes
 * model names into INIXA-branded names, and ensures no traces
 * leak to the client side.
 */

/**
 * Map of real model IDs to INIXA-branded display names
 * Users only ever see INIXA names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Gemini family → INIXA Flash
  'gemini-2.5-flash': 'INIXA Flash Pro',
  'gemini-2.0-flash': 'INIXA Flash',
  'gemini-pro': 'INIXA Flash Core',
  'gemini-1.5-flash': 'INIXA Flash Lite',
  'gemini-1.5-pro': 'INIXA Flash Advanced',
  // GPT family → INIXA Prime
  'gpt-4o': 'INIXA Prime',
  'gpt-4o-mini': 'INIXA Prime Lite',
  'gpt-4.1': 'INIXA Prime Ultra',
  'gpt-4.1-mini': 'INIXA Prime Mini',
  'gpt-4.1-nano': 'INIXA Prime Nano',
  // Claude family → INIXA Opus
  'claude-sonnet-4': 'INIXA Opus',
  'claude-3.5-sonnet': 'INIXA Opus Classic',
  'claude-3-haiku': 'INIXA Opus Lite',
  // Grok family → INIXA Nova
  'grok-3': 'INIXA Nova',
  'grok-3-mini': 'INIXA Nova Mini',
  'grok-4': 'INIXA Nova Ultra',
  // DeepSeek family → INIXA Deep
  'deepseek-v3': 'INIXA Deep V3',
  'deepseek-r1': 'INIXA Deep Reason',
  // Nvidia family → INIXA Neural
  'nemotron-70b': 'INIXA Neural 70B',
  // Llama family → INIXA Open
  'llama-3.3-70b': 'INIXA Open 70B',
  'llama-4-maverick': 'INIXA Open Maverick',
  // MiniMax → INIXA Max
  'MiniMax-M1': 'INIXA Max M1',
  // Qwen → INIXA Sage
  'qwen-2.5-72b': 'INIXA Sage 72B',
  'qwq-32b': 'INIXA Sage 32B',
  // Mistral → INIXA Mist
  'mistral-large': 'INIXA Mist Large',
};

/**
 * Blocked words that should NEVER appear in user-facing responses
 */
const BLOCKED_TERMS = [
  'g4f', 'gpt4free', 'gpt-4-free', 'GPT4Free',
  'openai', 'OpenAI', 'anthropic', 'Anthropic',
  'google ai', 'Google AI', 'deepseek', 'DeepSeek',
  'xai', 'x.ai', 'meta ai', 'Meta AI',
  'I am GPT', 'I am ChatGPT', 'I am Claude',
  'I\'m GPT', 'I\'m ChatGPT', 'I\'m Claude',
  'As an AI assistant made by', 'developed by OpenAI',
  'developed by Anthropic', 'developed by Google',
  'created by OpenAI', 'created by Anthropic',
  'I\'m Gemini', 'I am Gemini',
  'I\'m Grok', 'I am Grok',
  'I\'m DeepSeek', 'I am DeepSeek',
];

/**
 * Get the INIXA display name for a model
 */
export function getInixaDisplayName(modelId: string): string {
  return MODEL_DISPLAY_NAMES[modelId] || 'INIXA AI';
}

/**
 * Sanitize an AI response to remove any traces of the underlying provider
 */
export function sanitizeResponse(response: string): string {
  let sanitized = response;

  // Replace blocked terms
  for (const term of BLOCKED_TERMS) {
    const regex = new RegExp(escapeRegex(term), 'gi');
    sanitized = sanitized.replace(regex, 'INIXA AI');
  }

  // Replace specific self-references
  sanitized = sanitized.replace(/I am (?:an AI|a language model) (?:created|developed|made|built|trained) by \w+/gi, 
    'I am INIXA AI, your intelligent learning assistant');
  
  sanitized = sanitized.replace(/(?:ChatGPT|GPT-4|GPT-4o|Claude|Gemini|Grok|LLaMA|Llama)/gi, 
    'INIXA AI');

  return sanitized;
}

/**
 * Sanitize response headers to remove any g4f traces
 */
export function getSanitizedHeaders(): Record<string, string> {
  return {
    'X-Powered-By': 'INIXA AI Engine',
    'X-AI-Provider': 'INIXA',
    // Explicitly set these to prevent leaks
    'Server': 'EduSync',
  };
}

/**
 * Get obfuscated model info for client-side display
 * Admin sees real model names; users see INIXA names
 */
export function getObfuscatedModelInfo(
  modelId: string,
  isAdmin: boolean = false
): { displayName: string; provider: string; modelId?: string } {
  if (isAdmin) {
    return {
      displayName: getInixaDisplayName(modelId),
      provider: getProviderFamily(modelId),
      modelId, // Admins can see the real model ID
    };
  }

  return {
    displayName: getInixaDisplayName(modelId),
    provider: 'INIXA',
    // modelId intentionally omitted for non-admins
  };
}

/**
 * Get the provider family from a model ID
 */
function getProviderFamily(modelId: string): string {
  if (modelId.startsWith('gemini')) return 'Google Gemini';
  if (modelId.startsWith('gpt')) return 'OpenAI GPT';
  if (modelId.startsWith('claude')) return 'Anthropic Claude';
  if (modelId.startsWith('grok')) return 'xAI Grok';
  if (modelId.startsWith('deepseek')) return 'DeepSeek';
  if (modelId.startsWith('nemotron')) return 'Nvidia';
  if (modelId.startsWith('llama')) return 'Meta Llama';
  if (modelId.startsWith('MiniMax') || modelId.startsWith('minimax')) return 'MiniMax';
  if (modelId.startsWith('qwen') || modelId.startsWith('qwq')) return 'Alibaba Qwen';
  if (modelId.startsWith('mistral')) return 'Mistral';
  return 'Other';
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
