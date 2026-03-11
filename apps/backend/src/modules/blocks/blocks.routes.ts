import { Response, NextFunction, Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { BlockType } from "@prisma/client";

const blocksService = {
  async create(
    pageId: string,
    userId: string,
    data: { type: BlockType; content: object; order: number },
  ) {
    const page = await prisma.page.findFirst({
      where: { id: pageId, authorId: userId },
    });
    if (!page) throw new AppError("Page not found", 404);

    await prisma.block.updateMany({
      where: { pageId, order: { gte: data.order } },
      data: { order: { increment: 1 } },
    });

    return prisma.block.create({
      data: { ...data, pageId },
    });
  },

  async update(
    id: string,
    userId: string,
    data: { content?: object; type?: BlockType; order?: number },
  ) {
    const block = await assertBlockOwner(id, userId);

    if (data.order !== undefined && data.order !== block.order) {
      const isMovingDown = data.order > block.order;
      await prisma.block.updateMany({
        where: {
          pageId: block.pageId,
          order: isMovingDown
            ? { gt: block.order, lte: data.order }
            : { gte: data.order, lt: block.order },
        },
        data: { order: { increment: isMovingDown ? -1 : 1 } },
      });
    }

    return prisma.block.update({ where: { id }, data });
  },

  async delete(id: string, userId: string) {
    const block = await assertBlockOwner(id, userId);

    await prisma.block.delete({ where: { id } });

    await prisma.block.updateMany({
      where: { pageId: block.pageId, order: { gt: block.order } },
      data: { order: { decrement: 1 } },
    });

    return { success: true };
  },

  async bulkUpdate(
    pageId: string,
    userId: string,
    blocks: { id: string; content: object; order: number; type: BlockType }[],
  ) {
    const page = await prisma.page.findFirst({
      where: { id: pageId, authorId: userId },
    });
    if (!page) throw new AppError("Page not found", 404);

    const ops = blocks.map((b) =>
      prisma.block.update({
        where: { id: b.id },
        data: { content: b.content, order: b.order, type: b.type },
      }),
    );

    const result = await prisma.$transaction(ops);

    await prisma.version.create({
      data: { pageId, snapshot: blocks },
    });

    return result;
  },
};

const blockTypes = Object.values(BlockType) as [BlockType, ...BlockType[]];

const createBlockSchema = z.object({
  type: z.enum(blockTypes),
  content: z.record(z.unknown()),
  order: z.number().int().min(0),
});

const updateBlockSchema = z.object({
  type: z.enum(blockTypes).optional(),
  content: z.record(z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
});

const bulkUpdateSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.enum(blockTypes),
      content: z.record(z.unknown()),
      order: z.number().int().min(0),
    }),
  ),
});

export const blocksRoutes = Router();
blocksRoutes.use(authenticate);

blocksRoutes.post(
  "/:pageId",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = createBlockSchema.parse(req.body);
      const block = await blocksService.create(
        req.params.pageId,
        req.userId!,
        data,
      );
      res.status(201).json(block);
    } catch (err) {
      next(err);
    }
  },
);

blocksRoutes.patch(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateBlockSchema.parse(req.body);
      const block = await blocksService.update(
        req.params.id,
        req.userId!,
        data,
      );
      res.json(block);
    } catch (err) {
      next(err);
    }
  },
);

blocksRoutes.delete(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await blocksService.delete(req.params.id, req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

blocksRoutes.patch(
  "/:pageId/bulk",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { blocks } = bulkUpdateSchema.parse(req.body);
      const result = await blocksService.bulkUpdate(
        req.params.pageId,
        req.userId!,
        blocks,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

async function assertBlockOwner(blockId: string, userId: string) {
  const block = await prisma.block.findFirst({
    where: { id: blockId, page: { authorId: userId } },
  });
  if (!block) throw new AppError("Block not found", 404);
  return block;
}
