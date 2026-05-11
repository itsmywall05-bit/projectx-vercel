import React from "react";

/**
 * Inline markdown-lite: **bold**, *italic*, line breaks.
 * Safe — does not parse HTML, only the three patterns above.
 */
export function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // First split on newlines to preserve them
  const lines = text.split("\n");
  lines.forEach((line, lineIdx) => {
    // Bold first: **xxx**
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    parts.forEach((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        nodes.push(<strong key={key++}>{part.slice(2, -2)}</strong>);
      } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        nodes.push(<em key={key++}>{part.slice(1, -1)}</em>);
      } else if (part) {
        nodes.push(<React.Fragment key={key++}>{part}</React.Fragment>);
      }
    });
    if (lineIdx < lines.length - 1) {
      nodes.push(<br key={key++} />);
    }
  });

  return nodes;
}
