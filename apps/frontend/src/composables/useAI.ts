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

const loading = ref(false);
const error = ref<string | null>(null);

export function useAI() {
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

  return {
    loading,
    error,
    summarize: (content: string) =>
      call<{ result: string }>("summarize", { content }),
    improve: (content: string) =>
      call<{ result: string }>("improve", { content }),
    fixGrammar: (content: string) =>
      call<{ result: string }>("fix-grammar", { content }),
    makeShorter: (content: string) =>
      call<{ result: string }>("make-shorter", { content }),
    makeLonger: (content: string) =>
      call<{ result: string }>("make-longer", { content }),
    changeTone: (content: string, tone: AITone) =>
      call<{ result: string }>("change-tone", { content, tone }),
    suggestTags: (content: string) =>
      call<{ tags: string[] }>("suggest-tags", { content }),
    generate: (prompt: string, context?: string) =>
      call<{ result: string }>("generate", { prompt, context }),
    complete: (content: string) =>
      call<{ result: string }>("complete", { content }),
  };
}
