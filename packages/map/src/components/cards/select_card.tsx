import { Badge } from "@kyosan-map/ui/components/badge";
import { Button } from "@kyosan-map/ui/components/button";
import { Card, CardContent } from "@kyosan-map/ui/components/card";
import { X } from "lucide-react";
import React from "react";
import { CATEGORY_CARD_STYLE } from "../../config";
import { SelectedCardProps } from "../../types/map-type";
import { AccentBar } from "./accent_bar";
import { SafeImage } from "./safe_image";

const IMAGE_SIZE = 85;
const ACCENT_EXTRA = 10;

export function SelectCard({
  facility,
  handleCloseClick,
  handleClick,
  distanceFromGeolocate,
}: SelectedCardProps) {
  const palette = CATEGORY_CARD_STYLE[facility.type];
  const headingId = React.useId();

  const onCardClick = React.useCallback(() => {
    handleClick(facility.id);
  }, [handleClick, facility.id]);

  const onCloseClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Close clicked");
      handleCloseClick();
    },
    [handleCloseClick]
  );

  return (
    <Card
      className="relative rounded-xl"
      style={{ padding: 4, marginBottom: 8 }}
      onClick={onCardClick}
      onMouseDown={(e) => {
        // クリック時にフォーカスを防ぐ
        e.preventDefault();
      }}
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
        onClick={onCloseClick}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          // クリック時にフォーカスを防ぐ
          e.preventDefault();
        }}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </Button>

      <CardContent className="px-2.5 py-2 sm:px-3 sm:py-2.5">
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
            <p
              className="text-xs text-muted-foreground leading-snug h-[2.7rem] overflow-hidden"
              style={{
                height: "2.7rem",
              }}
            >
              {facility.description}
            </p>
            {facility.tags && facility.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {facility.tags.map((t) => (
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
            {distanceFromGeolocate && (
              <div
                style={{ fontSize: 10, marginTop: 2 }}
                className="text-muted-foreground"
              >
                {"現在地から " + distanceFromGeolocate + " m"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
