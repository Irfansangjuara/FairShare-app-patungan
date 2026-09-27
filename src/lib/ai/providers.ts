/**
 * Multi-Provider AI Adapter for FairShare
 * Supports: DeepSeek, Claude, Gemini, OpenCode Go, 9Router, and OpenRouter
 */

export type AIProviderId =
  | "deepseek"
  | "claude"
  | "gemini"
  | "opencode_go"
  | "9router"
  | "openrouter";

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
}

export interface ProviderDefinition {
  id: AIProviderId;
  name: string;
  badge: string;
  description: string;
  defaultModel: string;
  commonModels: AIModelOption[];
  requiresApiKey: boolean;
  docUrl: string;
}

export const AI_PROVIDERS: ProviderDefinition[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "Populer & Ekonomis",
    description: "Model penalaran canggih dan hemat biaya dari DeepSeek AI.",
    defaultModel: "deepseek-chat",
    requiresApiKey: true,
    docUrl: "https://platform.deepseek.com/",
    commonModels: [
      { id: "deepseek-chat", name: "DeepSeek V3 (Chat)", description: "Cepat, sangat pintar, dan ekonomis" },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoner)", description: "Penalaran matematika dan logika mendalam" },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Google AI",
    description: "Multimodal cepat dengan jendela konteks luas dari Google.",
    defaultModel: "gemini-1.5-flash",
    requiresApiKey: true,
    docUrl: "https://aistudio.google.com/",
    commonModels: [
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Sangat cepat dan andal untuk percakapan bot" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Kapasitas penalaran tinggi dan instruksi kompleks" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Generasi terbaru Google AI berlatensi rendah" },
    ],
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    badge: "Akurasi Tinggi",
    description: "Kecerdasan tinggi dalam nuansa bahasa dan kepatuhan instruksi ketat.",
    defaultModel: "claude-3-5-sonnet-20241022",
    requiresApiKey: true,
    docUrl: "https://console.anthropic.com/",
    commonModels: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Kombinasi terbaik kecerdasan dan kecepatan" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Ringan, responsif, dan hemat kuota" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "Multi-Model Agregator",
    description: "Akses ratusan model LLM dari berbagai provider dengan 1 API key.",
    defaultModel: "deepseek/deepseek-chat",
    requiresApiKey: true,
    docUrl: "https://openrouter.ai/",
    commonModels: [
      { id: "deepseek/deepseek-chat", name: "OpenRouter: DeepSeek Chat", description: "Performa tinggi via agregator" },
      { id: "anthropic/claude-3.5-sonnet", name: "OpenRouter: Claude 3.5 Sonnet", description: "Model Claude via OpenRouter" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "OpenRouter: Llama 3.3 70B", description: "Open weights tercanggih dari Meta" },
      { id: "google/gemini-flash-1.5", name: "OpenRouter: Gemini Flash 1.5", description: "Model Google via OpenRouter" },
    ],
  },
  {
    id: "opencode_go",
    name: "OpenCode Go",
    badge: "OpenCode Gateway",
    description: "Gerbang API LLM untuk produktivitas coding dan otomasi agen.",
    defaultModel: "opencode-v1",
    requiresApiKey: true,
    docUrl: "https://opencode.ai/",
    commonModels: [
      { id: "opencode-v1", name: "OpenCode Standard", description: "Model default OpenCode Go" },
      { id: "opencode-glm4", name: "OpenCode GLM-4", description: "Optimal untuk pemrosesan teks bahasa Asia" },
    ],
  },
  {
    id: "9router",
    name: "9Router",
    badge: "AI Proxy",
    description: "Router proxy berkinerja tinggi dengan komputasi terdistribusi.",
    defaultModel: "gpt-4o-mini",
    requiresApiKey: true,
    docUrl: "https://9router.com/",
    commonModels: [
      { id: "gpt-4o-mini", name: "9Router: GPT-4o Mini", description: "Responsif dan hemat biaya" },
      { id: "deepseek-v3", name: "9Router: DeepSeek V3", description: "Model DeepSeek via proxy 9Router" },
    ],
  },
];

export function maskSecret(secret?: string | null): string {
  if (!secret) return "";
  const trimmed = secret.trim();
  if (trimmed.length <= 8) return "••••••••";
  const start = trimmed.slice(0, 4);
  const end = trimmed.slice(-4);
  return `${start}••••••••${end}`;
}

export interface AIGenerateRequest {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  customModelId?: string | null;
  systemPrompt?: string;
  userPrompt: string;
}

export interface AIGenerateResponse {
  success: boolean;
  content: string;
  error?: string;
}

/**
 * Universal adapter to call different AI providers
 */
export async function executeAIRequest({
  provider,
  apiKey,
  model,
  customModelId,
  systemPrompt = "Kamu adalah asisten keuangan FairShare yang ramah, ringkas, dan presisi dalam menghitung patungan.",
  userPrompt,
}: AIGenerateRequest): Promise<AIGenerateResponse> {
  const effectiveModel = (customModelId && customModelId.trim()) || model;

  try {
    switch (provider) {
      case "deepseek": {
        const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: effectiveModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            content: "",
            error: data.error?.message || `DeepSeek Error (${res.status}): ${res.statusText}`,
          };
        }
        return {
          success: true,
          content: data.choices?.[0]?.message?.content || "(Tidak ada respons teks)",
        };
      }

      case "claude": {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey.trim(),
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: effectiveModel,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            max_tokens: 1024,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            content: "",
            error: data.error?.message || `Anthropic Claude Error (${res.status}): ${res.statusText}`,
          };
        }
        const textBlock = data.content?.find((b: any) => b.type === "text");
        return {
          success: true,
          content: textBlock?.text || "(Tidak ada respons teks)",
        };
      }

      case "gemini": {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nPengguna: ${userPrompt}` }],
              },
            ],
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            content: "",
            error: data.error?.message || `Google Gemini Error (${res.status}): ${res.statusText}`,
          };
        }
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return {
          success: true,
          content: candidate || "(Tidak ada respons teks)",
        };
      }

      case "openrouter": {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
            "HTTP-Referer": "https://fairshare.copilotmarketing.id",
            "X-Title": "FairShare AI Agent",
          },
          body: JSON.stringify({
            model: effectiveModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            content: "",
            error: data.error?.message || `OpenRouter Error (${res.status}): ${res.statusText}`,
          };
        }
        return {
          success: true,
          content: data.choices?.[0]?.message?.content || "(Tidak ada respons teks)",
        };
      }

      case "opencode_go":
      case "9router": {
        // OpenAI compatible endpoints
        const endpoint =
          provider === "9router"
            ? "https://api.9router.com/v1/chat/completions"
            : "https://api.opencode.ai/v1/chat/completions";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: effectiveModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            content: "",
            error: data.error?.message || `${provider} Error (${res.status}): ${res.statusText}`,
          };
        }
        return {
          success: true,
          content: data.choices?.[0]?.message?.content || "(Tidak ada respons teks)",
        };
      }

      default:
        return {
          success: false,
          content: "",
          error: `Provider AI "${provider}" tidak didukung.`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      content: "",
      error: `Gagal menghubungkan ke ${provider}: ${err?.message || "Kesalahan jaringan"}`,
    };
  }
}
