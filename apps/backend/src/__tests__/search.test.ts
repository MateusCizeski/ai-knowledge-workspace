import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { app } from "../server";
import { prisma } from "../config/prisma";

const request = supertest(app);

const testUser = {
  email: `search-test-${Date.now()}@workspace.test`,
  name: "Search Test User",
  password: "test123",
};

let authToken = "";
let testPageId = "";

describe("Search Routes", () => {
  beforeAll(async () => {
    const reg = await request.post("/api/auth/register").send(testUser);
    authToken = reg.body.token;

    const page = await request
      .post("/api/pages")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "TypeScript Guide", icon: "📘" });

    testPageId = page.body.id;

    await request
      .patch(`/api/blocks/${testPageId}/bulk`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        blocks: [
          {
            id: `temp-1`,
            type: "HEADING_1",
            content: { text: "TypeScript Guide" },
            order: 0,
          },
          {
            id: `temp-2`,
            type: "TEXT",
            content: {
              text: "TypeScript is a strongly typed programming language",
            },
            order: 1,
          },
          {
            id: `temp-3`,
            type: "CODE",
            content: { text: "const x: number = 42", language: "typescript" },
            order: 2,
          },
        ],
      });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it("should return 401 without auth", async () => {
    const res = await request.get("/api/search?q=typescript");
    expect(res.status).toBe(401);
  });

  it("should return 422 with empty query", async () => {
    const res = await request
      .get("/api/search?q=")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(422);
  });

  it("should find page by title match", async () => {
    const res = await request
      .get("/api/search?q=TypeScript")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    const found = res.body.results.find((r: any) => r.id === testPageId);
    expect(found).toBeDefined();
    expect(found.title).toBe("TypeScript Guide");
  });

  it("should find page by block content", async () => {
    const res = await request
      .get("/api/search?q=strongly+typed")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const found = res.body.results.find((r: any) => r.id === testPageId);
    expect(found).toBeDefined();
    expect(found.matches.length).toBeGreaterThan(0);
    expect(found.matches[0].excerpt).toContain("strongly typed");
  });

  it("should return empty results for no match", async () => {
    const res = await request
      .get("/api/search?q=xyznotfoundabcdef")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(0);
  });

  it("should not return other users pages", async () => {
    const other = await request.post("/api/auth/register").send({
      email: `other-${Date.now()}@workspace.test`,
      name: "Other User",
      password: "test123",
    });

    const res = await request
      .get("/api/search?q=TypeScript")
      .set("Authorization", `Bearer ${other.body.token}`);

    const leaked = res.body.results.find((r: any) => r.id === testPageId);
    expect(leaked).toBeUndefined();

    await prisma.user.deleteMany({ where: { email: other.body.user.email } });
  });
});
