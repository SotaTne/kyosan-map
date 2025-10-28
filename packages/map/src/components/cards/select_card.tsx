import { Badge } from "@kyosan-map/ui/components/badge";
import { Button } from "@kyosan-map/ui/components/button";
import { Card, CardContent } from "@kyosan-map/ui/components/card";
import { X } from "lucide-react";
import React from "react";
import { CATEGORY_CARD_STYLE } from "../../config";
import { CardProps } from "../../types/map-type";
import { AccentBar } from "./accent_bar";
import { SafeImage } from "./safe_image";

const IMAGE_SIZE = 85;
const ACCENT_EXTRA = 10;

export function SelectCard({
  title,
  description,
  category,
  tags,
  image,
}: Omit<CardProps, "distanceM">) {
  const palette = CATEGORY_CARD_STYLE[category];
  const headingId = React.useId();

  return (
    <Card
      className="relative rounded-xl"
      style={{ padding: 4, marginBottom: 8 }}
    >
      {/* バッテンを“枠上に半分出す”配置。Card 自体を基準にする */}
      <Button
        size="icon"
        variant="outline"
        aria-label="このカードを閉じる"
        className="h-6 w-6 rounded-full shadow-sm bg-background border border-border"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          transform: "translate(40%, -40%)", // ← 角から少し外側へ
        }}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </Button>

      <CardContent className="px-2.5 py-2 sm:px-3 sm:py-2.5">
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
            <p
              className="text-xs text-muted-foreground leading-snug h-[3rem] overflow-hidden"
              style={{
                height: "3rem",
              }}
            >
              {description}
            </p>
            {tags && tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    style={{
                      fontSize: 10,
                    }}
                    className="text-[10px] font-normal"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
