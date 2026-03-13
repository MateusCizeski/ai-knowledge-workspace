import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { aiService, type AITone } from "./ai.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { AppError } from "../../middleware/error.middleware";

export const aiRoutes = Router();
aiRoutes.use(authenticate);

function requireAIKey(_req: AuthRequest, _res: Response, next: NextFunction) {
  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "your_gemini_api_key_here"
  ) {
    return next(
      new AppError(
        "Gemini API key not configured. Add GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com",
        503,
      ),
    );
  }
  next();
}

aiRoutes.use(requireAIKey);

const contentSchema = z.object({ content: z.string().min(1).max(20000) });

aiRoutes.post(
  "/summarize",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const result = await aiService.summarize(content);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/improve",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const result = await aiService.improve(content);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/fix-grammar",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const result = await aiService.fixGrammar(content);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/make-shorter",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const result = await aiService.makeShorter(content);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/make-longer",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const result = await aiService.makeLonger(content);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/change-tone",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schema = contentSchema.extend({
        tone: z.enum(["professional", "casual", "formal", "friendly"]),
      });
      const { content, tone } = schema.parse(req.body);
      const result = await aiService.changeTone(content, tone as AITone);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/suggest-tags",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const tags = await aiService.suggestTags(content);
      res.json({ tags });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/generate",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1).max(2000),
        context: z.string().max(10000).optional(),
      });
      const { prompt, context } = schema.parse(req.body);
      const result = await aiService.generate(prompt, context);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);

aiRoutes.post(
  "/complete",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content } = contentSchema.parse(req.body);
      const result = await aiService.complete(content);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },
);
