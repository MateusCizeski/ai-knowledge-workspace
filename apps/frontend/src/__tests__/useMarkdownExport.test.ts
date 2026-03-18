import { describe, it, expect } from "vitest";
import { useMarkdownExport } from "@/composables/useMarkdownExport";
import type { Block } from "@/stores/pages.store";

const { blocksToMarkdown } = useMarkdownExport();

function makeBlock(type: Block["type"], content: Record<string, any>): Block {
  return { id: "test-id", type, content, order: 0, pageId: "page-1" };
}

describe("useMarkdownExport", () => {
  describe("blocksToMarkdown — headings", () => {
    it("converts HEADING_1 to # heading", () => {
      const md = blocksToMarkdown(
        [makeBlock("HEADING_1", { text: "My Title" })],
        "Page",
        "📄",
      );
      expect(md).toContain("# My Title");
    });

    it("converts HEADING_2 to ## heading", () => {
      const md = blocksToMarkdown(
        [makeBlock("HEADING_2", { text: "Section" })],
        "Page",
      );
      expect(md).toContain("## Section");
    });

    it("converts HEADING_3 to ### heading", () => {
      const md = blocksToMarkdown(
        [makeBlock("HEADING_3", { text: "Sub" })],
        "Page",
      );
      expect(md).toContain("### Sub");
    });
  });

  describe("blocksToMarkdown — text types", () => {
    it("converts TEXT block to plain text", () => {
      const md = blocksToMarkdown(
        [makeBlock("TEXT", { text: "Hello world" })],
        "Page",
      );
      expect(md).toContain("Hello world");
    });

    it("converts QUOTE block with > prefix", () => {
      const md = blocksToMarkdown(
        [makeBlock("QUOTE", { text: "Famous quote" })],
        "Page",
      );
      expect(md).toContain("> Famous quote");
    });

    it("converts CALLOUT with emoji and bold note", () => {
      const md = blocksToMarkdown(
        [makeBlock("CALLOUT", { text: "Important", emoji: "" })],
        "Page",
      );
      expect(md).toContain("");
      expect(md).toContain("Important");
    });
  });

  describe("blocksToMarkdown — lists", () => {
    it("converts BULLET to - item", () => {
      const md = blocksToMarkdown(
        [makeBlock("BULLET", { text: "Item one" })],
        "Page",
      );
      expect(md).toContain("- Item one");
    });

    it("converts CHECKLIST unchecked to - [ ] item", () => {
      const md = blocksToMarkdown(
        [makeBlock("CHECKLIST", { text: "Todo", checked: false })],
        "Page",
      );
      expect(md).toContain("- [ ] Todo");
    });

    it("converts CHECKLIST checked to - [x] item", () => {
      const md = blocksToMarkdown(
        [makeBlock("CHECKLIST", { text: "Done", checked: true })],
        "Page",
      );
      expect(md).toContain("- [x] Done");
    });

    it("numbers NUMBERED blocks sequentially", () => {
      const blocks = [
        makeBlock("NUMBERED", { text: "First" }),
        makeBlock("NUMBERED", { text: "Second" }),
        makeBlock("NUMBERED", { text: "Third" }),
      ];
      const md = blocksToMarkdown(blocks, "Page");
      expect(md).toContain("1. First");
      expect(md).toContain("2. Second");
      expect(md).toContain("3. Third");
    });

    it("resets NUMBERED counter after non-list block", () => {
      const blocks = [
        makeBlock("NUMBERED", { text: "First" }),
        makeBlock("TEXT", { text: "Break" }),
        makeBlock("NUMBERED", { text: "Reset" }),
      ];
      const md = blocksToMarkdown(blocks, "Page");
      const lines = md.split("\n");
      const numberedLines = lines.filter((l) => /^\d+\./.test(l));
      expect(numberedLines[0]).toBe("1. First");
      expect(numberedLines[1]).toBe("1. Reset");
    });
  });

  describe("blocksToMarkdown — special blocks", () => {
    it("converts DIVIDER to ---", () => {
      const md = blocksToMarkdown([makeBlock("DIVIDER", {})], "Page");
      const count = (md.match(/^---$/gm) || []).length;
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it("converts CODE block with language fence", () => {
      const md = blocksToMarkdown(
        [
          makeBlock("CODE", {
            text: 'console.log("hi")',
            language: "javascript",
          }),
        ],
        "Page",
      );
      expect(md).toContain("```javascript");
      expect(md).toContain('console.log("hi")');
      expect(md).toContain("```");
    });

    it("converts IMAGE block to markdown image syntax", () => {
      const md = blocksToMarkdown(
        [
          makeBlock("IMAGE", {
            src: "https://example.com/img.png",
            caption: "My image",
          }),
        ],
        "Page",
      );
      expect(md).toContain("![My image](https://example.com/img.png)");
    });
  });

  describe("blocksToMarkdown — frontmatter and title", () => {
    it("includes frontmatter with title", () => {
      const md = blocksToMarkdown([], "My Page", "");
      expect(md).toContain('title: "My Page"');
      expect(md).toContain("exported:");
    });

    it("includes page title as H1 with icon", () => {
      const md = blocksToMarkdown([], "My Page", "");
      expect(md).toContain("# My Page");
    });

    it("includes page title as H1 without icon", () => {
      const md = blocksToMarkdown([], "My Page");
      expect(md).toContain("# My Page");
    });

    it("ends with newline", () => {
      const md = blocksToMarkdown([makeBlock("TEXT", { text: "Hi" })], "Page");
      expect(md.endsWith("\n")).toBe(true);
    });

    it("does not have consecutive empty lines", () => {
      const blocks = [
        makeBlock("TEXT", { text: "A" }),
        makeBlock("TEXT", { text: "B" }),
        makeBlock("TEXT", { text: "C" }),
      ];
      const md = blocksToMarkdown(blocks, "Page");
      expect(md).not.toContain("\n\n\n");
    });
  });
});
