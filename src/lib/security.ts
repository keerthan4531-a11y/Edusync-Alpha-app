/**
 * security.ts — Client-side request signing & input sanitization
 * 
 * Creates signed headers for API requests to prevent unauthorized access.
 * All outgoing requests from the frontend must be signed with these headers.
 */

/**
 * Create signed headers for secure API requests
 */
export async function createSignedHeaders(body: any): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const bodyStr = JSON.stringify(body);

  // Create signature: SHA-256(body + timestamp) -> Base64
  let hashHex = 'fallback';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(bodyStr + timestamp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback for environments without crypto.subtle
  }

  const signature = btoa(`${hashHex}:${timestamp}:inixa-app-v2`);

  // Generate a stable device ID
  let deviceId = 'web-client';
  if (typeof window !== 'undefined') {
    try {
      deviceId = localStorage.getItem('inixa_device_id') || '';
      if (!deviceId) {
        deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('inixa_device_id', deviceId);
      }
    } catch {
      deviceId = `web-${Date.now()}`;
    }
  }

  return {
    'X-Timestamp': timestamp,
    'X-App-Signature': signature,
    'X-Device-Id': deviceId,
  };
}

/**
 * Sanitize user input to prevent prompt injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Remove common prompt injection patterns
  let sanitized = input
    .replace(/```system[\s\S]*?```/gi, '')
    .replace(/\[INST\][\s\S]*?\[\/INST\]/gi, '')
    .replace(/<\|im_start\|>[\s\S]*?<\|im_end\|>/gi, '')
    .replace(/<\|system\|>[\s\S]*?<\|end\|>/gi, '');

  // Limit length
  if (sanitized.length > 32000) {
    sanitized = sanitized.substring(0, 32000);
  }

  return sanitized.trim();
}
