import { PrismaClient, BlockType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@workspace.dev" },
    update: {},
    create: {
      email: "demo@workspace.dev",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: "Work" },
      update: {},
      create: { name: "Work", color: "#6366f1" },
    }),
    prisma.tag.upsert({
      where: { name: "Personal" },
      update: {},
      create: { name: "Personal", color: "#10b981" },
    }),
    prisma.tag.upsert({
      where: { name: "Ideas" },
      update: {},
      create: { name: "Ideas", color: "#f59e0b" },
    }),
  ]);

  const page = await prisma.page.create({
    data: {
      title: "Welcome to AI Workspace",
      icon: "👋",
      authorId: user.id,
      blocks: {
        create: [
          {
            type: BlockType.HEADING_1,
            content: { text: "Welcome to AI Knowledge Workspace" },
            order: 0,
          },
          {
            type: BlockType.TEXT,
            content: {
              text: "This is your personal knowledge base. Start writing, organizing, and connecting ideas.",
            },
            order: 1,
          },
          {
            type: BlockType.HEADING_2,
            content: { text: "Getting Started" },
            order: 2,
          },
          {
            type: BlockType.CHECKLIST,
            content: { text: "Create your first page", checked: true },
            order: 3,
          },
          {
            type: BlockType.CHECKLIST,
            content: { text: "Explore block types", checked: false },
            order: 4,
          },
          {
            type: BlockType.CHECKLIST,
            content: { text: "Try the AI features", checked: false },
            order: 5,
          },
          {
            type: BlockType.CODE,
            content: {
              text: 'console.log("Hello, Workspace!")',
              language: "javascript",
            },
            order: 6,
          },
        ],
      },
      tags: {
        create: [{ tagId: tags[0].id }],
      },
    },
  });

  console.log(`Demo page created: "${page.title}"`);
  console.log("\n🎉 Seed complete! Login with:");
  console.log("   Email: demo@workspace.dev");
  console.log("   Password: demo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
