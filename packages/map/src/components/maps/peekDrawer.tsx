"use client";

import { useMemo, useState } from "react";
import { Drawer } from "vaul";

const HEAD_PX = 60; // ハンドル＋ヘッダの高さ

export function PeekDrawer({
  containerStyle,
  containerClassName,
  openDrawerPx = 200,
}: {
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  openDrawerPx?: number;
}) {
  const openDrawerMemoPx = useMemo(
    () => Math.max(openDrawerPx, HEAD_PX), // 安全クランプ
    [openDrawerPx]
  );

  const snapPoints = useMemo<[`${number}px`, `${number}px`]>(
    () => [`${HEAD_PX}px`, `${openDrawerMemoPx}px`],
    [openDrawerMemoPx]
  );

  // 初期は“ピーク”状態から
  const [snapPoint, setSnapPoint] = useState<string | number | null>(
    snapPoints[0]
  );
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <div>
      {/* container は常時描画して ref を確定 */}
      <div
        ref={setContainer}
        className={containerClassName}
        style={{ position: "relative", ...containerStyle }}
      />

      {container && (
        <Drawer.Root
          container={container}
          direction="bottom"
          modal={false}
          dismissible={false}
          noBodyStyles
          snapPoints={snapPoints}
          activeSnapPoint={snapPoint}
          setActiveSnapPoint={setSnapPoint}
          snapToSequentialPoint
          defaultOpen
          fadeFromIndex={0}
        >
          <Drawer.Portal container={container}>
            {/* 背景を触れるので pointer-events はなし */}
            <Drawer.Overlay className="pointer-events-none bg-black/50" />

            <Drawer.Content
              // 位置は Vaul に任せる（absolute など付けない）
              className="
                rounded-t-lg border-t bg-background text-foreground shadow-lg
              "
              style={{
                height: `${openDrawerMemoPx}px`,
                width: "90%", // container 幅にフィット
                margin: "0 auto", // 必要ならセンタリング
                padding: "0 4px",
              }}
            >
              {/* ハンドル（デザインは自由に変えてOK） */}
              <Drawer.Handle className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-muted/80" />

              {/* 見出し（スクリーンリーダー用なら sr-only） */}
              <Drawer.Title className="sr-only">Peek Drawer</Drawer.Title>

              {/* スクロール領域（ヘッダ分を引いた高さ） */}
              <div
                style={{
                  height: `${openDrawerMemoPx - HEAD_PX}px`,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: "calc(env(safe-area-inset-bottom,0) + 16px)",
                }}
                className="px-5"
              >
                <div className="mx-auto max-w-md space-y-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <p key={i} className="text-muted-foreground">
                      テキスト行 {i + 1}
                    </p>
                  ))}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </div>
  );
}
