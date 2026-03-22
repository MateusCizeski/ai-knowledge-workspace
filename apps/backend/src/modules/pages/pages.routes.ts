import { Response, NextFunction, Router } from "express";
import { z } from "zod";
import { pagesService } from "./pages.service";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  icon: z.string().max(10).optional(),
  parentId: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  icon: z.string().max(10).optional(),
  coverImage: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
});

const reorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
      parentId: z.string().nullable(),
    }),
  ),
});

const ctrl = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pages = await pagesService.list(req.userId!);
      res.json(pages);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = await pagesService.getById(req.params.id, req.userId!);
      res.json(page);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const page = await pagesService.create(req.userId!, data);
      res.status(201).json(page);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);

      const page = await pagesService.update(req.params.id, req.userId!, {
        ...data,
        coverImage: data.coverImage ?? undefined,
      });

      res.json(page);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await pagesService.delete(req.params.id, req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { updates } = reorderSchema.parse(req.body);
      const result = await pagesService.reorder(req.userId!, updates);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

export const pagesRoutes = Router();
pagesRoutes.use(authenticate);

pagesRoutes.get("/", ctrl.list);
pagesRoutes.get("/:id", ctrl.getById);
pagesRoutes.post("/", ctrl.create);
pagesRoutes.patch("/:id", ctrl.update);
pagesRoutes.delete("/:id", ctrl.delete);
pagesRoutes.patch("/reorder/bulk", ctrl.reorder);
