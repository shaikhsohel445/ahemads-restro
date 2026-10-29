import type { Block } from "@/content/site/blog/types";

/** Renders article/legal blocks with consistent typography. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-foreground/90">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i} className="mt-6 text-2xl font-bold tracking-tight text-foreground">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="mt-2 text-xl font-semibold text-foreground">{b.text}</h3>;
          case "ul":
            return (
              <ul key={i} className="flex list-disc flex-col gap-2 ps-6 marker:text-primary">
                {b.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="flex list-decimal flex-col gap-2 ps-6 marker:font-semibold marker:text-primary">
                {b.items.map((it) => <li key={it}>{it}</li>)}
              </ol>
            );
          case "note":
            return <p key={i} className="rounded-2xl border border-[#E6D5AE] bg-[#F6EEDC] px-5 py-4 text-[15px] text-[#5E4A1E]">{b.text}</p>;
          default:
            return <p key={i}>{b.text}</p>;
        }
      })}
    </div>
  );
}
