// "use client";

// import {
//   Drawer,
//   DrawerContent,
//   DrawerTitle,
// } from "@kyosan-map/ui/components/drawer"; // 上のラッパーのパスに合わせて
// import * as React from "react";
// // import { cn } from "@/lib/utils"; // 必要なら

// const snapPoints = ["40px", 0.45] as const; // px と比率の混在OK  [oai_citation:5‡Emil Kowalski](https://vaul.emilkowal.ski/snap-points)

// /**
//  * @param container  … Drawer をコンテナ基準（absolute）で張りたいときに渡す。未確定なら描画を遅らせる。
//  */

// export function PeekDrawer({ container }: { container?: HTMLElement | null }) {
//   // スナップの制御（必要なければ外してもOK）
//   const [snap, setSnap] = React.useState<string | number | null>(snapPoints[0]);

//   // container がまだ null の場合は描画しない（Radix/Portal 警告回避）
//   if (!container) return null;

//   return (
//     <Drawer
//       container={container} // ★ Root に渡すのが公式のやり方（Portalには渡せない）  [oai_citation:6‡Emil Kowalski](https://vaul.emilkowal.ski/api)
//       defaultOpen
//       modal={false} // ★ 背景（地図）を触れるようにする  [oai_citation:7‡Emil Kowalski](https://vaul.emilkowal.ski/snap-points)
//       dismissible={false}
//       snapPoints={snapPoints as unknown as (string | number)[]}
//       activeSnapPoint={snap}
//       setActiveSnapPoint={setSnap}
//       snapToSequentialPoint
//     >
//       {/* Content は "absolute bottom-0" ＋ 高さは --snap-point-height に任せる */}
//       <DrawerContent>
//         {/* 1行目（auto）: タイトルエリア等 */}
//         <DrawerTitle>Drawer</DrawerTitle>
//         <div className="px-5 pb-2">
//           {/* 表示用タイトルを出したいならここに */}
//           {/* <h2 className="font-medium text-gray-900">Ira Glass on Taste</h2> */}
//         </div>

//         {/* 2行目（minmax(0,1fr)）: スクロール領域 */}
//         <div
//           className="
//             min-h-0 overflow-y-auto overscroll-contain
//             px-5 pb-[calc(env(safe-area-inset-bottom,0)+16px)]
//             touch-pan-y [-webkit-overflow-scrolling:touch]
//           "
//         >
//           <div className="mx-auto max-w-md space-y-4">
//             {Array.from({ length: 60 }).map((_, i) => (
//               <p key={i} className="text-gray-600">
//                 テキスト行 {i + 1}
//               </p>
//             ))}
//           </div>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// }

// "use client";

// import {
//   Drawer,
//   DrawerContent,
//   DrawerTitle,
// } from "@kyosan-map/ui/components/drawer";
// import { useEffect, useMemo, useState } from "react";

// export function PeekDrawer({
//   openSnapPoint,
//   isOpen,
// }: {
//   openSnapPoint: `${number}px`;
//   isOpen?: boolean;
// }) {
//   const closeSnapPoint = "40px";
//   const snapPoints = useMemo<[string, string]>(
//     () => [closeSnapPoint, openSnapPoint],
//     [closeSnapPoint, openSnapPoint]
//   );

//   const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
//   useEffect(() => {
//     setSnap(isOpen ? snapPoints[1] : snapPoints[0]);
//   }, [isOpen, snapPoints]);

//   const [drawerOpen, setDrawerOpen] = useState(true);

//   // ヘッダ(ハンドル含む)の実高さ。24px(タイトル領域) + 40px(クローズ時ピーク分) = 64px
//   const HEADER_PX = 64;

//   return (
//     <Drawer
//       snapPoints={snapPoints}
//       activeSnapPoint={snap}
//       setActiveSnapPoint={setSnap}
//       snapToSequentialPoint
//       modal={false}
//       dismissible={false}
//       open={drawerOpen}
//       onOpenChange={() => setDrawerOpen(true)}
//       onClose={() => setDrawerOpen(true)}
//     >
//       <DrawerContent
//         // Vaul が付与する --snap-point-height を優先。フォールバックに openSnapPoint を入れておく
//         style={{
//           height: `var(--snap-point-height, ${openSnapPoint})`,
//         }}
//       >
//         {/* ヘッダ（auto行） */}
//         <div className="pt-4 max-h-[24px]">
//           <DrawerTitle className="sr-only">Peek Drawer</DrawerTitle>
//         </div>

//         {/* スクロール領域（1fr行） */}
//         <div
//           className="
//             min-h-0 overflow-y-auto overscroll-contain
//             touch-pan-y [-webkit-overflow-scrolling:touch]
//             px-5 pb-[calc(env(safe-area-inset-bottom,0)+16px)]
//           "
//           style={{
//             height: `calc(var(--snap-point-height, ${openSnapPoint}) - ${HEADER_PX}px)`,
//           }}
//         >
//           <div className="mx-auto max-w-md space-y-4">
//             {Array.from({ length: 60 }).map((_, i) => (
//               <p key={i} className="text-gray-600">
//                 テキスト行 {i + 1}
//               </p>
//             ))}
//           </div>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// }

// "use client";

// import { Drawer } from "vaul";

// export function PeekDrawer({ container }: { container: HTMLElement | null }) {
//   console.log("PeekDrawer render", { container });
//   return (
//     <Drawer.Root>
//       <Drawer.Trigger asChild>
//         <button>Open Drawer</button>
//       </Drawer.Trigger>
//       <Drawer.Portal>
//         <Drawer.Overlay />
//         <Drawer.Content className="border">
//           <Drawer.Title>DrawerTitle</Drawer.Title>
//           <div>DrawerContent</div>
//         </Drawer.Content>
//       </Drawer.Portal>
//     </Drawer.Root>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Drawer } from "vaul";

// const snapPoints = ["40px", "200px"];

// export function PeekDrawer({
//   containerStyle,
//   containerClassName,
// }: {
//   containerStyle?: React.CSSProperties;
//   containerClassName?: string;
// }) {
//   const [snapPoint, setSnapPoint] = useState<string | number | null>();
//   const [container, setContainer] = useState<HTMLElement | null>(null);
//   console.log("PeekDrawer render", { container });

//   return (
//     <div>
//       {/*container div*/}
//       <div
//         ref={setContainer}
//         style={containerStyle}
//         className={containerClassName || ""}
//       />
//       <Drawer.Root
//         container={container}
//         modal={false}
//         //dismissible={false}
//         snapPoints={snapPoints}
//         activeSnapPoint={snapPoint}
//         setActiveSnapPoint={setSnapPoint}
//         snapToSequentialPoint
//       >
//         <Drawer.Trigger asChild>
//           <button>Open Drawer</button>
//         </Drawer.Trigger>
//         <Drawer.Portal>
//           <Drawer.Overlay />
//           <Drawer.Content
//             style={{ border: "2px solid black", backgroundColor: "green" }}
//           >
//             <Drawer.Title>DrawerTitle</Drawer.Title>
//             <h1>peekSnapPoint {snapPoint}</h1>
//             <div>DrawerContent</div>
//           </Drawer.Content>
//         </Drawer.Portal>
//       </Drawer.Root>
//     </div>
//   );
// }

"use client";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@kyosan-map/ui/components/drawer"; // 上のラッパーのパスに合わせて
import * as React from "react";
// import { cn } from "@/lib/utils"; // 必要なら

const snapPoints: (string | number)[] = ["40px", "100px"]; // px と比率の混在OK  [oai_citation:5‡Emil Kowalski](https://vaul.emilkowal.ski/snap-points)

/**
 * @param container  … Drawer をコンテナ基準（absolute）で張りたいときに渡す。未確定なら描画を遅らせる。
 */

export function PeekDrawer({
  containerStyle,
  containerClassName,
}: {
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
}) {
  // スナップの制御（必要なければ外してもOK）
  const [snap, setSnap] = React.useState<string | number | null>(
    snapPoints[0]!
  );
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  // container がまだ null の場合は描画しない（Radix/Portal 警告回避）

  return (
    <div>
      <div
        style={containerStyle}
        className={containerClassName}
        ref={setContainer}
      />
      <Drawer
        container={container} // ★ Root に渡すのが公式のやり方（Portalには渡せない）  [oai_citation:6‡Emil Kowalski](https://vaul.emilkowal.ski/api)
        // defaultOpen
        //modal={false} // ★ 背景（地図）を触れるようにする  [oai_citation:7‡Emil Kowalski](https://vaul.emilkowal.ski/snap-points)
        //dismissible={false}
        snapPoints={snapPoints}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        snapToSequentialPoint
      >
        {/* Content は "absolute bottom-0" ＋ 高さは --snap-point-height に任せる */}
        <DrawerTrigger asChild>
          <button>Open Drawer</button>
        </DrawerTrigger>
        <DrawerContent>
          {/* 1行目（auto）: タイトルエリア等 */}
          <DrawerTitle>Drawer</DrawerTitle>
          <div className="px-5 pb-2">
            {/* 表示用タイトルを出したいならここに */}
            {/* <h2 className="font-medium text-gray-900">Ira Glass on Taste</h2> */}
          </div>

          {/* 2行目（minmax(0,1fr)）: スクロール領域 */}
          <div
            style={{
              maxHeight: "200px", //`calc(var(--snap-point-height) - 64px)`,
            }}
            className="
             min-h-0 overflow-y-auto overscroll-contain
             px-5 pb-[calc(env(safe-area-inset-bottom,0)+16px)]
             touch-pan-y [-webkit-overflow-scrolling:touch]
           "
          >
            <div className="mx-auto max-w-md space-y-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} className="text-gray-600">
                  テキスト行 {i + 1}
                </p>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
