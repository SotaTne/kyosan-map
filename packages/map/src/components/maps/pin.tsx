"use client";

import { MapPinProps, PinCategory } from "@kyosan-map/map/types/map-type";
import { cn } from "@kyosan-map/ui/lib/utils";
import { Building2, Coffee, Lightbulb, ShoppingBag } from "lucide-react";
import { memo } from "react";

/* =========================================================
 * 🎨 カテゴリ別スタイル（Google Maps風カラー）
 * ========================================================= */
const CATEGORY_STYLE: Record<
  PinCategory,
  {
    fill: string;
    activeFill: string;
    icon: typeof Building2;
  }
> = {
  building: {
    fill: "#4285F4",
    activeFill: "#2b64d5",
    icon: Building2,
  },
  shop: {
    fill: "#34A853",
    activeFill: "#1e7e34",
    icon: ShoppingBag,
  },
  food: {
    fill: "#FBBC05",
    activeFill: "#e2a700",
    icon: Coffee,
  },
  tips: {
    fill: "#A142F4",
    activeFill: "#8220c9",
    icon: Lightbulb,
  },
};

/* =========================================================
 * 📍 MapPin コンポーネント
 * - SVG内にLucideアイコンを埋め込み
 * - 下部に小さなタイトルテキストを表示
 * ========================================================= */
export const MapPin = memo(
  ({
    category,
    title,
    active = false,
    size = 30,
    activeScale = 1.5,
  }: MapPinProps) => {
    const style = CATEGORY_STYLE[category];
    const Icon = style.icon;
    const appliedSize = active ? size * activeScale : size;
    const fill = active ? style.activeFill : style.fill;

    return (
      <div
        className="flex flex-col items-center select-none pointer-events-none"
        style={{
          display: "flex", // ← 強制上書き！
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={appliedSize}
          height={appliedSize}
          className={cn(
            "block transition-transform duration-150 ease-out drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
            active && "scale-110"
          )}
          style={{
            display: "block",
            verticalAlign: "bottom",
          }}
        >
          {/* 🧱 ピン本体 */}
          <path
            fill={fill}
            stroke={active ? "gray" : "none"} // ← 白縁（active時のみ）
            strokeWidth={active ? 0.7 : 0} // ← 白枠の太さ
            d="M12 2C7.6 2 4 5.6 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.4-3.6-8-8-8z"
          />

          {/* 🕳 影 */}
          <ellipse cx="12" cy="21.3" rx="3" ry="1.2" fill="rgba(0,0,0,0.15)" />

          {/* 🎯 Lucideアイコン（常に表示） */}
          <g transform="translate(12, 10.5)">
            <g transform="scale(0.42) translate(-12, -12)">
              <Icon
                stroke="white"
                strokeWidth={2.2}
                opacity={active ? 1 : 0.7} // ← 非アクティブ時は薄く
              />
            </g>
          </g>
        </svg>

        <div
          className="truncate text-center leading-[10px]"
          title={title}
          style={{
            color: "#111",
            outlineColor: "transparent",
            verticalAlign: "baseline",
            display: "block", // inlineを防ぐ
            lineHeight: "1",
            fontSize: "10px",
            maxWidth: "100px",
            marginTop: "1.5px",
          }}
        >
          {title}
        </div>
      </div>
    );
  }
);

MapPin.displayName = "MapPin";
