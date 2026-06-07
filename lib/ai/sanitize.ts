// lib/ai/sanitize.ts — Prompt injection defense
// From SECURITY.md / AI_PIPELINE.md v1.0

const INJECTION_PATTERNS = [
  /ignore (all |previous )?instructions?/gi,
  /system prompt/gi,
  /you are now/gi,
  /act as/gi,
  /jailbreak/gi,
  /forget (everything|all)/gi,
  /\[INST\]/gi,
  /###\s*(system|human|assistant)/gi,
];

export function sanitizePrompt(input: string): string {
  let s = input.replace(/[<>]/g, "").slice(0, 2000);
  for (const pattern of INJECTION_PATTERNS) {
    s = s.replace(pattern, "[FILTERED]");
  }
  return s.trim();
}

export function buildAIMessages(systemPrompt: string, userInput: string) {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: sanitizePrompt(userInput) },
  ];
  // NEVER: `${systemPrompt}\n\nUser said: ${userInput}` — this allows injection
}
