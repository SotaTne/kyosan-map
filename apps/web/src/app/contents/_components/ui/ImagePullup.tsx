"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ImagePullup({ src, onClose }: { src: string; onClose: () => void }) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  const ratio = natural ? (natural.h / natural.w) * 100 : 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-t-2xl w-full max-w-md p-4"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full mb-4 rounded-xl overflow-hidden max-h-[75vh] min-h-[200px]"
          style={{ paddingBottom: `${ratio}%` }}
        >
          <Image
            src={src}
            alt="preview"
            fill
            style={{ objectFit: "contain" }}
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
        </div>

        <button className="w-full py-2 bg-gray-800 text-white rounded-lg" onClick={onClose}>
          閉じる
        </button>
      </motion.div>
    </motion.div>
  );
}
