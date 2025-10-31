"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImagePullup({ src }: { src: string }) {
  const [ratio, setRatio] = useState(100);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setRatio((img.naturalHeight / img.naturalWidth) * 100);
      }
    };
    img.src = src;
  }, [src]);

  return (
    <div
      className="relative w-full mb-4 rounded-xl overflow-hidden max-h-[75vh] min-h-[200px]"
      style={{ paddingBottom: `${ratio}%` }}
    >
      <Image src={src} alt="" fill style={{ objectFit: "contain" }} sizes="100vw" priority />
    </div>
  );
}
