import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini Flash — free tier: 15 RPM, 1M tokens/day
// Get your key at: https://aistudio.google.com
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  });
}

export type AIAction =
  | "summarize"
  | "improve"
  | "suggest_tags"
  | "generate"
  | "fix_grammar"
  | "make_shorter"
  | "make_longer"
  | "change_tone";

export type AITone = "professional" | "casual" | "formal" | "friendly";

export const aiService = {
  async summarize(content: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
      `Summarize the following content concisely in 2-3 sentences. Return only the summary, no preamble:\n\n${content}`,
    );
    return result.response.text().trim();
  },

  async improve(content: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
      `Improve the following text to be clearer, more engaging and professional. Preserve the original meaning and structure. Return only the improved text, no explanations:\n\n${content}`,
    );
    return result.response.text().trim();
  },

  async fixGrammar(content: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
      `Fix grammar, spelling, and punctuation in the following text. Return only the corrected text, no explanations:\n\n${content}`,
    );
    return result.response.text().trim();
  },

  async makeShorter(content: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
      `Make the following text shorter and more concise while preserving the key ideas. Return only the shortened text:\n\n${content}`,
    );
    return result.response.text().trim();
  },

  async makeLonger(content: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
      `Expand the following text with more detail, examples, and explanation while staying on topic. Return only the expanded text:\n\n${content}`,
    );
    return result.response.text().trim();
  },

  async changeTone(content: string, tone: AITone): Promise<string> {
    const model = getModel();
    const toneDesc: Record<AITone, string> = {
      professional: "professional and authoritative",
      casual: "casual and conversational",
      formal: "formal and structured",
      friendly: "warm, friendly, and approachable",
    };
    const result = await model.generateContent(
      `Rewrite the following text in a ${toneDesc[tone]} tone. Return only the rewritten text:\n\n${content}`,
    );
    return result.response.text().trim();
  },

  async suggestTags(content: string): Promise<string[]> {
    const model = getModel();
    const result = await model.generateContent(
      `Analyze the following content and suggest 3-6 relevant tags/keywords that best categorize it.
Return ONLY a JSON array of strings, no explanation. Example: ["productivity", "design", "tools"]

Content:
${content}`,
    );
    try {
      const text = result.response.text().trim();
      const json = text.replace(/```json|```/g, "").trim();
      const tags = JSON.parse(json);
      return Array.isArray(tags) ? tags.slice(0, 6) : [];
    } catch {
      return [];
    }
  },

  async generate(prompt: string, context?: string): Promise<string> {
    const model = getModel();
    const systemContext = context
      ? `Context from the current document:\n${context}\n\n`
      : "";
    const result = await model.generateContent(
      `${systemContext}Generate content based on the following request. Return only the generated content:\n\n${prompt}`,
    );
    return result.response.text().trim();
  },

  async complete(text: string): Promise<string> {
    const model = getModel();
    const result = await model.generateContent(
      `Continue writing the following text naturally. Write 1-3 sentences that flow naturally from what's already there. Return only the continuation:\n\n${text}`,
    );
    return result.response.text().trim();
  },
};
