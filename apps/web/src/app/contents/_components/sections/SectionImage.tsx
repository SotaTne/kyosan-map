"use client";

import Image from "next/image";
import { getContentsFullUrl } from "../../contents";
import { ImageContents, UserViewFlag } from "../../type";

export function SectionImage({
  imageAllItems,
  userItemFlags,
  onClick,
}: {
  imageAllItems: ImageContents[];
  userItemFlags: UserViewFlag[];
  onClick: (item: ImageContents) => void;
}) {
  return (
    <section className="px-4 py-6">
      <h2 className="text-lg font-semibold text-center mb-6 text-muted-foreground">
        イラスト
      </h2>
      <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
        {imageAllItems.map((it) => {
          const flag = userItemFlags.find((f) => f.contentsId === it.id);
          const isLocked = flag ? !flag.unlocked : true;
          const imageUrl = it.thumbUrl ?? it.displayUrl;
          return (
            <button
              key={it.id}
              onClick={() => {
                if (!isLocked) onClick(it);
              }}
              className="relative w-full aspect-square bg-black rounded-lg overflow-hidden transition-transform active:scale-95 hover:scale-105"
            >
              <Image
                src={getContentsFullUrl(imageUrl)}
                alt={it.title}
                fill
                style={{ objectFit: "cover" }}
                className={isLocked ? "blur-sm" : ""}
              />
              {isLocked && (
                <span className="absolute inset-0 grid place-items-center bg-black/50 text-white text-sm">
                  未解放
                </span>
              )}
              <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs text-center py-1">
                {it.title}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
