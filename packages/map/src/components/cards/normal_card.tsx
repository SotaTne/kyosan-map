import { Card, CardContent } from "@kyosan-map/ui/components/card";
import * as React from "react";
import { CATEGORY_CARD_STYLE } from "../../config";
import { CardProps } from "../../types/map-type";
import { AccentBar } from "./accent_bar";
import { SafeImage } from "./safe_image";

const IMAGE_SIZE = 80; // ← 二回り小さく
const ACCENT_EXTRA = 8; // 画像より少し長いアクセント

export function NormalCard({
  title,
  description,
  category,
  image,
  distanceM,
}: CardProps) {
  const palette = CATEGORY_CARD_STYLE[category];
  const headingId = React.useId();

  return (
    <Card
      className="rounded-xl"
      style={{ padding: 4, marginBottom: 8 }} // 外枠の余白を最小限に
      onClick={() => {
        console.log("NormalCard clicked");
      }}
    >
      <CardContent
        className="px-2.5 py-2 sm:px-3 sm:py-2.5" // ← CardContent のデフォルト p-6 を上書き
      >
        <div className="flex items-center gap-2">
          <AccentBar category={category} height={IMAGE_SIZE + ACCENT_EXTRA} />
          <SafeImage
            src={image}
            alt={title}
            size={IMAGE_SIZE}
            fallbackColor={palette.accent}
          />
          <div className="min-w-0 flex-1">
            <h3
              id={headingId}
              className="mb-0.5 truncate font-medium leading-tight text-foreground text-[13px]"
            >
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-snug h-[2.1rem] overflow-hidden">
              {description}
            </p>
            <div
              style={{ fontSize: 10, marginTop: 2 }}
              className="text-muted-foreground"
            >
              選択地点から {Math.round(distanceM ?? 0)} m
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
