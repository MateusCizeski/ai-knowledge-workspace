import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { BlockType } from "@prisma/client";

export const searchRoutes = Router();
searchRoutes.use(authenticate);

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.string().optional(),
});

searchRoutes.get(
  "/",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = querySchema.safeParse(req.query);

      if (!parsed.success) {
        return res.status(422).json({
          error: parsed.error.format(),
        });
      }

      const { q, limit = "20" } = parsed.data;

      const take = Math.min(parseInt(limit), 50);
      const userId = req.userId!;
      const query = q.trim().toLowerCase();

      const textBlockTypes: BlockType[] = [
        BlockType.TEXT,
        BlockType.HEADING_1,
        BlockType.HEADING_2,
        BlockType.HEADING_3,
        BlockType.QUOTE,
        BlockType.CALLOUT,
        BlockType.BULLET,
        BlockType.NUMBERED,
      ];

      const pagesByTitle = await prisma.page.findMany({
        where: {
          authorId: userId,
          title: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          icon: true,
          updatedAt: true,
          tags: { select: { tag: { select: { name: true, color: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        take,
      });

      const blockMatches = await prisma.block.findMany({
        where: {
          page: { authorId: userId },
          type: { in: textBlockTypes },
        },
        include: {
          page: {
            select: { id: true, title: true, icon: true, updatedAt: true },
          },
        },
        orderBy: { page: { updatedAt: "desc" } },
        take: take * 3,
      });

      const matchingBlocks = blockMatches.filter((b) => {
        const text = (b.content as any)?.text as string | undefined;
        return text && text.toLowerCase().includes(query);
      });

      const pageMap = new Map<
        string,
        {
          id: string;
          title: string;
          icon: string;
          updatedAt: Date;
          tags: { name: string; color: string }[];
          matches: { blockId: string; type: string; excerpt: string }[];
        }
      >();

      for (const p of pagesByTitle) {
        pageMap.set(p.id, {
          id: p.id,
          title: p.title,
          icon: p.icon || "📄",
          updatedAt: p.updatedAt,
          tags: p.tags.map((t) => t.tag),
          matches: [],
        });
      }

      for (const b of matchingBlocks) {
        const text = (b.content as any)?.text as string;
        const excerpt = buildExcerpt(text, query);

        if (!pageMap.has(b.page.id)) {
          pageMap.set(b.page.id, {
            id: b.page.id,
            title: b.page.title,
            icon: b.page.icon || "📄",
            updatedAt: b.page.updatedAt,
            tags: [],
            matches: [],
          });
        }

        const entry = pageMap.get(b.page.id)!;

        if (entry.matches.length < 2) {
          entry.matches.push({
            blockId: b.id,
            type: b.type,
            excerpt,
          });
        }
      }

      const results = Array.from(pageMap.values())
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, take);

      return res.json({
        results,
        total: results.length,
        query: q,
      });
    } catch (err) {
      next(err);
    }
  },
);

function buildExcerpt(text: string, query: string, contextChars = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());

  if (idx === -1) {
    return text.slice(0, contextChars * 2);
  }

  const start = Math.max(0, idx - contextChars);
  const end = Math.min(text.length, idx + query.length + contextChars);

  return (
    (start > 0 ? "…" : "") +
    text.slice(start, end) +
    (end < text.length ? "…" : "")
  );
}
