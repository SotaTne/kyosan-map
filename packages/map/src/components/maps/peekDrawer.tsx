"use client";

import { Root as VisualHiddenRoot } from "@radix-ui/react-visually-hidden";
import { useMemo, useState } from "react";
import { Drawer } from "vaul";
import { CardProps, FacilityTableInfo } from "../../types/map-type";
import { NormalCard } from "../cards/normal_card";
import { SelectCard } from "../cards/select_card";

const HEAD_PX = 30; // ハンドル＋ヘッダの高さ

export function PeekDrawer({
  containerStyle,
  containerClassName,
  openDrawerPx = 200,
  facilitiesTable,
}: {
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  openDrawerPx?: number;
  facilitiesTable?: FacilityTableInfo;
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
    snapPoints[1]
  );
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const items: CardProps[] = useMemo(
    () =>
      [
        {
          title: "図書館青葉",
          description: "自然光が入る静かな自習エリア。平日22時まで。",
          category: "building",
          tags: ["Wi‑Fi", "自習"],
          distanceM: 120,
        },
        {
          title: "商店街アーケード",
          description: "老舗と新店が並ぶ散策スポット。雨でも歩きやすい。",
          category: "shop",
          tags: ["散策"],
          distanceM: 350,
        },
        {
          title: "喫茶ひだまり",
          description: "ネルドリップの深煎り。厚切りトーストが人気。",
          category: "food",
          tags: ["モーニング"],
          distanceM: 210,
        },
        {
          title: "資料館別館",
          description: "展示替え中。週末は学芸員トークあり。",
          category: "tips",
          tags: ["展示"],
          distanceM: 480,
        },
        {
          title: "市民体育館",
          description: "夜間開放のランニングコース。シャワー有り。",
          category: "building",
          tags: ["運動"],
          distanceM: 640,
        },
      ] as const,
    []
  );

  const facilitiesDiv = useMemo(() => {
    // if (!facilitiesTable) return null;
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <SelectCard
          title={items[0]!.title}
          description={items[0]!.description}
          category={items[0]!.category}
          tags={items[0]!.tags}
          image={"/nonexistent.svg"}
        />
        {items.slice(1).map((it) => (
          <NormalCard key={it.title} {...it} image={"/nonexistent.svg"} />
        ))}
      </div>
    );
  }, [items]);

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
                group/drawer-content bg-background z-50 flex flex-col
                rounded-t-lg border-t text-foreground shadow-lg inset-x-0
              "
              style={{
                height: `${openDrawerMemoPx}px`,
                width: "100vw", // container 幅にフィット
              }}
            >
              <div
                style={{
                  height: `${HEAD_PX}px`,
                  maxHeight: `${HEAD_PX}px`,
                }}
              >
                {/* ハンドル（デザインは自由に変えてOK） */}
                <Drawer.Handle
                  style={{
                    width: "60px",
                    maxHeight: `${HEAD_PX}px`,
                    marginTop: "14px",
                    cursor: "grab",
                  }}
                  className="mx-auto mt-3 h-2 rounded-full bg-muted"
                />

                {/* 見出し（スクリーンリーダー用なら sr-only） */}
                <VisualHiddenRoot>
                  <Drawer.Title className="sr-only">Peek Drawer</Drawer.Title>
                </VisualHiddenRoot>
              </div>

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
                {facilitiesDiv}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </div>
  );
}
