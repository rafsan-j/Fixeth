// Bring-Your-Own-API (BYOA) client-side LLM helper.
//
// Keys live in the user's browser (preferences.ai), never on our server.
// Supports Google Gemini (REST) and a local Ollama host. All calls run from
// the client so there is zero platform inference cost.

export type AiPrefs = {
  apiKey: string;
  // For Gemini, this is the exact Google model id sent to the API
  // (e.g. "gemini-2.5-flash"). "ollama" routes to the local Ollama host.
  model: string;
  ollamaUrl: string;
  ollamaModel: string;
  persona?: string;
  defaultCognitiveLevel?: string;
};

// Local storage helpers — keys must only live in the user's browser.
const STORAGE_KEY = "fixeth:ai_prefs";

export function saveAiPrefsLocal(prefs: Partial<AiPrefs>) {
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
    const next = { ...prev, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("Could not save AI prefs to localStorage", err);
  }
}

export function getAiPrefsLocal(): Partial<AiPrefs> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AiPrefs>;
  } catch (err) {
    console.warn("Could not read AI prefs from localStorage", err);
    return null;
  }
}

export function removeAiPrefsLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Could not remove AI prefs from localStorage", err);
  }
}

// Migrate legacy friendly ids that were stored before we used real Google
// model names. Anything else is assumed to already be a valid Gemini model id.
const LEGACY_MODEL_MAP: Record<string, string> = {
  "gemini-flash": "gemini-2.5-flash",
  "gemini-pro": "gemini-2.5-pro",
  "gemini-1.5": "gemini-1.5-pro"
};

export function resolveGeminiModel(model: string): string {
  return LEGACY_MODEL_MAP[model] || model || "gemini-2.5-flash";
}

export type AiMessage = { role: "user" | "assistant"; content: string };

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI_NOT_CONFIGURED");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured(prefs: AiPrefs | undefined | null): boolean {
  if (!prefs) return false;
  if (prefs.model === "ollama") return Boolean(prefs.ollamaUrl && prefs.ollamaModel);
  return Boolean(prefs.apiKey);
}

async function callGemini(
  prefs: AiPrefs,
  system: string,
  messages: AiMessage[]
): Promise<string> {
  const model = resolveGeminiModel(prefs.model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    prefs.apiKey
  )}`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new Error(
        `Gemini quota exceeded (429) for model "${model}". This key has hit its free-tier rate/usage limit. ` +
          `Wait a minute and retry, switch to a lighter model (e.g. Gemini 2.5 Flash-Lite), or enable billing on the key.`
      );
    }
    if (res.status === 400 && /API key not valid/i.test(detail)) {
      throw new Error("Gemini rejected the API key (400). Check the key in Settings → AI Mentor.");
    }
    if (res.status === 404) {
      throw new Error(
        `Gemini model "${model}" was not found (404). Pick a different model in Settings → AI Mentor.`
      );
    }
    throw new Error(`Gemini API ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty response.");
  return text.trim();
}

async function callOllama(
  prefs: AiPrefs,
  system: string,
  messages: AiMessage[]
): Promise<string> {
  const res = await fetch(`${prefs.ollamaUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: prefs.ollamaModel,
      stream: false,
      messages: [{ role: "system", content: system }, ...messages]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = json?.message?.content ?? "";
  if (!text) throw new Error("Ollama returned an empty response.");
  return String(text).trim();
}

/**
 * Run a chat completion using the learner's own provider configuration.
 * Throws AiNotConfiguredError when no key/host is set.
 */
export async function runChat(
  prefs: AiPrefs,
  system: string,
  messages: AiMessage[]
): Promise<string> {
  if (!isAiConfigured(prefs)) throw new AiNotConfiguredError();
  if (prefs.model === "ollama") return callOllama(prefs, system, messages);
  return callGemini(prefs, system, messages);
}
