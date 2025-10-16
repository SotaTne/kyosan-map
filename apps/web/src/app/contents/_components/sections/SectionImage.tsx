"use client";
import Image from "next/image";

export function SectionImage({
  title,
  items,
  onClickItem,
}: {
  title: string;
  items: string[];
  onClickItem: (src: string) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{title} にあるもののアイコン</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
        {items.map((src, i) => (
          <button
            key={i}
            onClick={() => onClickItem(src)}
            className="relative w-32 h-32 sm:w-40 sm:h-40 bg-black rounded-xl overflow-hidden"
          >
            <Image src={src} alt="" fill style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>
    </section>
  );
}
