// "use client";

// import { useLayoutEffect, useState } from "react";
// import { Drawer } from "vaul";

// const snapPoints = ["64px", 0.5];

// export function PeekDrawer() {
//   const [snap, setSnap] = useState<number | string | null>(snapPoints[0]!);

//   // 🩹 Radixフォーカストラップ解除（vaulのmodalバグ回避）
//   useLayoutEffect(() => {
//     const stopPropagation = (e: Event) => e.stopImmediatePropagation();
//     document.addEventListener("focusin", stopPropagation);
//     document.addEventListener("focusout", stopPropagation);
//     return () => {
//       document.removeEventListener("focusin", stopPropagation);
//       document.removeEventListener("focusout", stopPropagation);
//     };
//   }, []);

//   return (
//     <Drawer.Root
//       modal={true}
//       snapPoints={snapPoints}
//       activeSnapPoint={snap}
//       setActiveSnapPoint={setSnap}
//       snapToSequentialPoint
//       defaultOpen
//       dismissible={false}
//     >
//       <Drawer.Portal>
//         {/* 背景はクリック可能 */}
//         <Drawer.Overlay className="fixed inset-0 bg-black/20 pointer-events-none" />

//         <Drawer.Content
//           className="
//             fixed bottom-0 left-0 right-0
//             flex flex-col
//             bg-background border-t border-border rounded-t-xl shadow-lg
//             max-h-[90%] sm:max-h-[600px]
//           "
//         >
//           {/* ハンドル */}
//           <Drawer.Handle className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted" />

//           {/* スクロールコンテンツ */}

//           <Drawer.Title>PeekDrawer</Drawer.Title>

//           <div className="flex-1 overflow-y-auto px-6 pb-8 rounded-t-xl">
//             <h1 className="text-lg font-semibold mt-2">
//               これらはテストコンテンツです
//             </h1>
//             <p className="mt-4 text-muted-foreground leading-relaxed">
//               この領域はスクロールが可能です。長文や多くのリストを入れても崩れません。
//             </p>

//             <div className="mt-6 space-y-4">
//               {Array.from({ length: 50 }).map((_, i) => (
//                 <p key={i} className="text-sm text-foreground/80">
//                   テキスト行 {i + 1} — スクロール挙動を確認できます。
//                 </p>
//               ))}
//             </div>
//           </div>
//         </Drawer.Content>
//       </Drawer.Portal>
//     </Drawer.Root>
//   );
// }

"use client";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@kyosan-map/ui/components/drawer";
import { useState } from "react";

const snapPoints = ["64px", 0.5, 1];

export function PeekDrawer() {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]!);
  console.log("PeekDrawer render");
  return (
    <Drawer
      defaultOpen
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      snapToSequentialPoint
      modal={false}
    >
      {/* <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 bg-black/40" /> */}

      {/* ← ここを Grid にして、明示的に内部スクロール領域を 1fr にする */}
      <DrawerContent
      // style={{
      //   height: "85svh",
      // }}
      >
        {/* ヘッダ（ハンドル＋タイトルなど）= gridの1行目（auto） */}
        <div className="pt-4">
          <DrawerTitle className="sr-only">Peek Drawer</DrawerTitle>
          <h2 className="px-5 mb-2 font-medium text-gray-900">
            Ira Glass on Taste
          </h2>
        </div>

        {/* スクロール領域 = gridの2行目（minmax(0,1fr)） */}
        <div
          style={{
            height: "40svh",
            overflowY: "auto",
          }}
          // className="
          //   min-h-0 overflow-y-auto overscroll-contain
          //   px-5 pb-[calc(env(safe-area-inset-bottom,0)+16px)]
          //   [-webkit-overflow-scrolling:touch] touch-pan-y
          // "
        >
          <div className="mx-auto max-w-md space-y-4">
            {Array.from({ length: 60 }).map((_, i) => (
              <p key={i} className="text-gray-600">
                テキスト行 {i + 1}
              </p>
            ))}
          </div>
        </div>
      </DrawerContent>
      {/* </DrawerPortal> */}
    </Drawer>
  );
}

// import { Drawer } from "vaul";

// export function PeekDrawer() {
//   return (
//     <Drawer.Root defaultOpen>
//       <Drawer.Portal>
//         <Drawer.Overlay className="fixed inset-0 bg-black/40" />

//         {/* ← ここを Grid にして、明示的に内部スクロール領域を 1fr にする */}
//         <Drawer.Content
//           // style={{
//           //   height: "85svh",
//           // }}
//           className={cn(
//             "flex max-h-[90svh] w-full max-w-md flex-col rounded-t-xl border-t border-gray-200 bg-white shadow-lg "
//           )}
//         >
//           {/* ヘッダ（ハンドル＋タイトルなど）= gridの1行目（auto） */}
//           <div className="pt-4">
//             <div
//               aria-hidden
//               className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300"
//             />
//             <Drawer.Title className="sr-only">Peek Drawer</Drawer.Title>
//             <h2 className="px-5 mb-2 font-medium text-gray-900">
//               Ira Glass on Taste
//             </h2>
//           </div>

//           {/* スクロール領域 = gridの2行目（minmax(0,1fr)） */}
//           <div
//             style={{
//               height: "80svh",
//               overflowY: "auto",
//             }}
//             className="
//               min-h-0 overflow-y-auto overscroll-contain
//               px-5 pb-[calc(env(safe-area-inset-bottom,0)+16px)]
//               [-webkit-overflow-scrolling:touch] touch-pan-y
//             "
//           >
//             <div className="mx-auto max-w-md space-y-4">
//               {Array.from({ length: 60 }).map((_, i) => (
//                 <p key={i} className="text-gray-600">
//                   テキスト行 {i + 1}
//                 </p>
//               ))}
//             </div>
//           </div>
//         </Drawer.Content>
//       </Drawer.Portal>
//     </Drawer.Root>
//   );
// }
