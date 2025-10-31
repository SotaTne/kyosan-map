import { Card, CardContent } from "@kyosan-map/ui/components/card";
import * as React from "react";
import { CATEGORY_CARD_STYLE } from "../../config";
import { CardProps } from "../../types/map-type";
import { AccentBar } from "./accent_bar";
import { SafeImage } from "./safe_image";

const IMAGE_SIZE = 80; // ← 二回り小さく
const ACCENT_EXTRA = 8; // 画像より少し長いアクセント

export function NormalCard({ facility, distance, handleClick }: CardProps) {
  const palette = CATEGORY_CARD_STYLE[facility.type];
  const headingId = React.useId();

  const onCardClick = React.useCallback(() => {
    handleClick(facility.id);
  }, [handleClick, facility.id]);

  return (
    <Card
      className="rounded-xl"
      style={{ padding: 4, marginBottom: 8 }} // 外枠の余白を最小限に
      onClick={onCardClick}
      onMouseDown={(e) => {
        // クリック時にフォーカスを防ぐ
        e.preventDefault();
      }}
    >
      <CardContent
        className="px-2.5 py-2 sm:px-3 sm:py-2.5" // ← CardContent のデフォルト p-6 を上書き
      >
        <div className="flex items-center gap-2">
          <AccentBar
            category={facility.type}
            height={IMAGE_SIZE + ACCENT_EXTRA}
          />
          <SafeImage
            src={facility.image}
            alt={facility.name}
            size={IMAGE_SIZE}
            fallbackColor={palette.accent}
          />
          <div className="min-w-0 flex-1">
            <h3
              id={headingId}
              className="mb-0.5 truncate font-medium leading-tight text-foreground text-[13px]"
            >
              {facility.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-snug h-[2.1rem] overflow-hidden">
              {facility.description}
            </p>
            {distance && (
              <div
                style={{ fontSize: 10, marginTop: 2 }}
                className="text-muted-foreground"
              >
                {(distance.from === "geolocate"
                  ? "現在地から "
                  : "選択地点から ") +
                  distance.meter +
                  " m"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
