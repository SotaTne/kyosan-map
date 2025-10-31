"use client";

export function PopupContainer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="w-full mt-4 py-2 bg-gray-800 text-white rounded-lg"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
