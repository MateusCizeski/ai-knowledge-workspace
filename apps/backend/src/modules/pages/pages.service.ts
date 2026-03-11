import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error.middleware";

export const pagesService = {
  async list(userId: string) {
    const pages = await prisma.page.findMany({
      where: { authorId: userId },
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        icon: true,
        parentId: true,
        order: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: { tag: { select: { id: true, name: true, color: true } } },
        },
        _count: { select: { children: true, blocks: true } },
      },
    });

    return pages.map((p) => ({
      ...p,
      tags: p.tags.map((pt) => pt.tag),
    }));
  },

  async getById(id: string, userId: string) {
    const page = await prisma.page.findFirst({
      where: { id, authorId: userId },
      include: {
        blocks: { orderBy: { order: "asc" } },
        tags: { select: { tag: true } },
        children: {
          select: { id: true, title: true, icon: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!page) throw new AppError("Page not found", 404);

    return { ...page, tags: page.tags.map((pt) => pt.tag) };
  },

  async create(
    userId: string,
    data: { title?: string; icon?: string; parentId?: string },
  ) {
    const maxOrder = await prisma.page.count({
      where: { authorId: userId, parentId: data.parentId ?? null },
    });

    return prisma.page.create({
      data: {
        title: data.title || "Untitled",
        icon: data.icon || "📄",
        parentId: data.parentId ?? null,
        order: maxOrder,
        authorId: userId,
        blocks: {
          create: [{ type: "TEXT", content: { text: "" }, order: 0 }],
        },
      },
      include: {
        blocks: true,
        tags: { select: { tag: true } },
      },
    });
  },

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      icon?: string;
      coverImage?: string;
      isPublished?: boolean;
    },
  ) {
    await assertOwner(id, userId);
    return prisma.page.update({
      where: { id },
      data,
      include: {
        tags: { select: { tag: true } },
        _count: { select: { children: true, blocks: true } },
      },
    });
  },

  async delete(id: string, userId: string) {
    await assertOwner(id, userId);
    await prisma.page.delete({ where: { id } });
    return { success: true };
  },

  async reorder(
    userId: string,
    updates: { id: string; order: number; parentId: string | null }[],
  ) {
    const ops = updates.map((u) =>
      prisma.page.updateMany({
        where: { id: u.id, authorId: userId },
        data: { order: u.order, parentId: u.parentId },
      }),
    );
    await prisma.$transaction(ops);
    return { success: true };
  },
};

async function assertOwner(pageId: string, userId: string) {
  const page = await prisma.page.findFirst({
    where: { id: pageId, authorId: userId },
  });
  if (!page) throw new AppError("Page not found", 404);
  return page;
}
