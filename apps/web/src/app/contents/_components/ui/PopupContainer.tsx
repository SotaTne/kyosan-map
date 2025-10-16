"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PopupContainer({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
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
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button className="w-full mt-4 py-2 bg-gray-800 text-white rounded-lg" onClick={onClose}>
          閉じる
        </button>
      </motion.div>
    </motion.div>
  );
}
