"use client";

import Image from "next/image";
import { ViewItem } from "../data/getCollectionForUser";

export default function SectionModel({
  title,
  items,
  onClick,
}: {
  title: string;
  items: ViewItem[];
  onClick: (item: ViewItem) => void;
}) {
  return (
    <section>
      <h2 className="font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onClick(it)}
            className="relative w-40 h-40 bg-black rounded-xl overflow-hidden"
          >
            <Image src={it.thumbUrl} alt={it.title} fill style={{ objectFit: "cover" }} />
            <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs text-center py-1">
              {it.title}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
