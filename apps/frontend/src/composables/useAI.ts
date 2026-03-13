import { ref } from "vue";
import { api } from "@/services/api";

export type AIAction =
  | "summarize"
  | "improve"
  | "fix_grammar"
  | "make_shorter"
  | "make_longer"
  | "suggest_tags"
  | "generate"
  | "complete";
export type AITone = "professional" | "casual" | "formal" | "friendly";

export function useAI() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function call<T>(endpoint: string, body: object): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post(`/ai/${endpoint}`, body);
      return data as T;
    } catch (err: any) {
      error.value = err.response?.data?.error || "AI request failed";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function summarize(content: string) {
    return call<{ result: string }>("summarize", { content });
  }

  async function improve(content: string) {
    return call<{ result: string }>("improve", { content });
  }

  async function fixGrammar(content: string) {
    return call<{ result: string }>("fix-grammar", { content });
  }

  async function makeShorter(content: string) {
    return call<{ result: string }>("make-shorter", { content });
  }

  async function makeLonger(content: string) {
    return call<{ result: string }>("make-longer", { content });
  }

  async function changeTone(content: string, tone: AITone) {
    return call<{ result: string }>("change-tone", { content, tone });
  }

  async function suggestTags(content: string) {
    return call<{ tags: string[] }>("suggest-tags", { content });
  }

  async function generate(prompt: string, context?: string) {
    return call<{ result: string }>("generate", { prompt, context });
  }

  async function complete(content: string) {
    return call<{ result: string }>("complete", { content });
  }

  return {
    loading,
    error,
    summarize,
    improve,
    fixGrammar,
    makeShorter,
    makeLonger,
    changeTone,
    suggestTags,
    generate,
    complete,
  };
}
