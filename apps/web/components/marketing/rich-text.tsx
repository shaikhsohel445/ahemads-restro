import { Fragment, type ReactNode } from "react";

/**
 * Renders a translated string that contains simple, non-nested inline tags,
 * e.g. "Point your client at <code>/api/v1/mcp</code>". Each tag name maps to
 * a renderer; unknown tags are rendered as plain text. This keeps whole
 * sentences in one message key, so translators can reorder them freely.
 */
export function rich(
  text: string,
  tags: Record<string, (content: string) => ReactNode>,
): ReactNode {
  const out: ReactNode[] = [];
  const pattern = /<([a-zA-Z]+)>(.*?)<\/\1>/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const render = tags[match[1]];
    out.push(<Fragment key={i++}>{render ? render(match[2]) : match[2]}</Fragment>);
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const strong = (c: string) => <strong className="text-foreground">{c}</strong>;

export const inlineCode = (c: string) => (
  <code dir="ltr" className="rounded bg-muted px-1.5 py-0.5 text-[13px] text-foreground">
    {c}
  </code>
);

export function linkTo(href: string, external = false) {
  return (c: string) => (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-primary underline underline-offset-4"
    >
      {c}
    </a>
  );
}
