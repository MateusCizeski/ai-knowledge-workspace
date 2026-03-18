import type { Block } from "@/stores/pages.store";

function blockToMarkdown(block: Block): string {
  const content = block.content as Record<string, any>;
  const text = (content.text as string) || "";

  switch (block.type) {
    case "HEADING_1":
      return `# ${text}`;
    case "HEADING_2":
      return `## ${text}`;
    case "HEADING_3":
      return `### ${text}`;
    case "TEXT":
      return text || "";
    case "QUOTE":
      return `> ${text}`;
    case "CALLOUT":
      return `> **${content.emoji || "💡"} Note:** ${text}`;
    case "BULLET":
      return `- ${text}`;
    case "NUMBERED":
      return `1. ${text}`;
    case "CHECKLIST":
      return `- [${content.checked ? "x" : " "}] ${text}`;
    case "DIVIDER":
      return "---";
    case "CODE": {
      const lang = (content.language as string) || "";
      return `\`\`\`${lang}\n${text}\n\`\`\``;
    }
    case "IMAGE": {
      const caption = (content.caption as string) || "image";
      const src = (content.src as string) || "";

      return `![${caption}](${src})`;
    }
    default:
      return text;
  }
}

function processNumberedBlocks(blocks: Block[]): Block[] {
  let counter = 0;
  return blocks.map((block, i) => {
    if (block.type === "NUMBERED") {
      counter++;
      const prev = blocks[i - 1];
      if (!prev || prev.type !== "NUMBERED") counter = 1;
      return { ...block, _numberedIndex: counter } as any;
    }
    counter = 0;
    return block;
  });
}

export function useMarkdownExport() {
  function blocksToMarkdown(
    blocks: Block[],
    title: string,
    icon?: string,
  ): string {
    const processed = processNumberedBlocks(blocks);

    const lines: string[] = [];

    lines.push("---");
    lines.push(`title: "${title}"`);
    lines.push(`exported: "${new Date().toISOString()}"`);
    lines.push("---");
    lines.push("");

    lines.push(`# ${icon ? icon + " " : ""}${title}`);
    lines.push("");

    for (let i = 0; i < processed.length; i++) {
      const block = processed[i] as any;
      let md = blockToMarkdown(block);

      if (block.type === "NUMBERED" && block._numberedIndex) {
        const text = (block.content.text as string) || "";
        md = `${block._numberedIndex}. ${text}`;
      }

      if (md) lines.push(md);

      const next = processed[i + 1];
      const isListType = ["BULLET", "NUMBERED", "CHECKLIST"].includes(
        block.type,
      );
      const nextIsListType =
        next && ["BULLET", "NUMBERED", "CHECKLIST"].includes(next.type);
      const sameListGroup =
        isListType && nextIsListType && block.type === next?.type;

      if (!sameListGroup && md) lines.push("");
    }

    return (
      lines
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim() + "\n"
    );
  }

  function downloadMarkdown(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportPage(blocks: Block[], title: string, icon?: string) {
    const md = blocksToMarkdown(blocks, title, icon);
    downloadMarkdown(md, title);
    return md;
  }

  return { exportPage, blocksToMarkdown };
}
