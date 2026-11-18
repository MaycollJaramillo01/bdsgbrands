import type { Block } from "@/content/legal";

// Plain-text editing format for policy blocks, one block per paragraph (blank line between):
//   ## Heading        → h2        ### Subheading → h3
//   - Label: text     → list item (label optional)
//   TBC: text         → fact BDSG still has to supply (blocks publishing)
//   anything else     → paragraph
export function toText(blocks: Block[]) {
  return blocks.map((b) =>
    b.t === "h2" ? `## ${b.text}` : b.t === "h3" ? `### ${b.text}` : b.t === "tbc" ? `TBC: ${b.text}` : b.t === "li" ? `- ${b.label ? `${b.label} ` : ""}${b.text}` : b.text,
  ).join("\n\n");
}

export function fromText(src: string): Block[] {
  return src.replace(/\r/g, "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p): Block => {
    if (p.startsWith("### ")) return { t: "h3", text: p.slice(4).trim() };
    if (p.startsWith("## ")) return { t: "h2", text: p.slice(3).trim() };
    if (/^TBC:/i.test(p)) return { t: "tbc", text: p.replace(/^TBC:\s*/i, "") };
    if (p.startsWith("- ")) {
      const m = p.slice(2).match(/^([^:]{1,60}:)\s+([\s\S]*)$/);
      return m ? { t: "li", label: m[1], text: m[2] } : { t: "li", text: p.slice(2) };
    }
    return { t: "p", text: p.replace(/\n/g, " ") };
  });
}
