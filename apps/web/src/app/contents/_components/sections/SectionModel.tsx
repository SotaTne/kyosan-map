"use client";
import Image from "next/image";

export function SectionModel({
  title,
  items,
  onClickItem,
}: {
  title: string;
  items: { icon: string; model: string; title: string }[];
  onClickItem: (model: string) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{title} にあるもののアイコン</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onClickItem(item.model)}
            className="relative w-32 h-32 sm:w-40 sm:h-40 bg-black rounded-xl overflow-hidden"
          >
            <Image src={item.icon} alt={item.title} fill style={{ objectFit: "cover" }} />
            <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs text-center py-1">
              {item.title}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
