import Image from "next/image";
import { cn } from "@/lib/utils";

/** A real product screenshot in a light browser-window frame. */
export function BrowserFrame({
  src,
  alt,
  width = 1600,
  height = 1000,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_-30px_rgb(10_61_49/0.45)]",
        className,
      )}
    >
      <div dir="ltr" className="flex h-8 items-center gap-1.5 border-b border-black/5 bg-[#F6F2EB] px-3" aria-hidden>
        <span className="size-2.5 rounded-full bg-[#E0705C]" />
        <span className="size-2.5 rounded-full bg-[#E2B656]" />
        <span className="size-2.5 rounded-full bg-[#5FB37C]" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className="block h-auto w-full"
      />
    </figure>
  );
}
