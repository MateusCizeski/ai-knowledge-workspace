import { Router, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { BlockType } from "@prisma/client";

export const versionsRoutes = Router();
versionsRoutes.use(authenticate);

versionsRoutes.get(
  "/:pageId",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;

      const page = await prisma.page.findFirst({
        where: { id: pageId, authorId: req.userId! },
      });
      if (!page) throw new AppError("Page not found", 404);

      const versions = await prisma.version.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          createdAt: true,
          snapshot: true,
        },
      });

      const withPreview = versions.map((v) => {
        const blocks = v.snapshot as any[];
        const firstText = blocks?.find(
          (b) =>
            ["TEXT", "HEADING_1", "HEADING_2"].includes(b.type) &&
            b.content?.text,
        );
        return {
          id: v.id,
          createdAt: v.createdAt,
          blockCount: blocks?.length ?? 0,
          preview: firstText?.content?.text?.slice(0, 80) || "Empty page",
        };
      });

      res.json(withPreview);
    } catch (err) {
      next(err);
    }
  },
);

versionsRoutes.post(
  "/:pageId/restore/:versionId",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { pageId, versionId } = req.params;

      const page = await prisma.page.findFirst({
        where: { id: pageId, authorId: req.userId! },
      });
      if (!page) throw new AppError("Page not found", 404);

      const version = await prisma.version.findFirst({
        where: { id: versionId, pageId },
      });
      if (!version) throw new AppError("Version not found", 404);

      const snapshotBlocks = version.snapshot as {
        id: string;
        type: BlockType;
        content: object;
        order: number;
      }[];

      const currentBlocks = await prisma.block.findMany({
        where: { pageId },
        orderBy: { order: "asc" },
      });
      await prisma.version.create({
        data: { pageId, snapshot: currentBlocks },
      });

      await prisma.block.deleteMany({ where: { pageId } });

      await prisma.block.createMany({
        data: snapshotBlocks.map((b) => ({
          type: b.type,
          content: b.content,
          order: b.order,
          pageId,
        })),
      });

      const updatedPage = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
          blocks: { orderBy: { order: "asc" } },
          tags: { select: { tag: true } },
        },
      });

      res.json(updatedPage);
    } catch (err) {
      next(err);
    }
  },
);

versionsRoutes.delete(
  "/:pageId",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { pageId } = req.params;

      const page = await prisma.page.findFirst({
        where: { id: pageId, authorId: req.userId! },
      });
      if (!page) throw new AppError("Page not found", 404);

      const versions = await prisma.version.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      const toDelete = versions.slice(20).map((v) => v.id);
      if (toDelete.length > 0) {
        await prisma.version.deleteMany({ where: { id: { in: toDelete } } });
      }

      res.json({
        deleted: toDelete.length,
        kept: Math.min(versions.length, 20),
      });
    } catch (err) {
      next(err);
    }
  },
);
