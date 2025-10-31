"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@kyosan-map/ui/components/toggle-group";
import * as React from "react";
import { useMapContext } from "../../contexts/map-context";
import { FilterState } from "../../types/map-state-type";

const ON_COLORS: Record<
  "building" | "food" | "shop" | "tips",
  { bg: string; text: string; ring?: string }
> = {
  building: { bg: "#6B8EB3", text: "#FFFFFF", ring: "rgba(107,142,179,0.35)" }, // steel blue
  food: { bg: "#C97A7A", text: "#FFFFFF", ring: "rgba(201,122,122,0.35)" }, // muted rose
  shop: { bg: "#C7A45A", text: "#0F172A", ring: "rgba(199,164,90,0.35)" }, // calm ochre
  tips: { bg: "#8C7AC1", text: "#FFFFFF", ring: "rgba(140,122,193,0.35)" }, // soft violet
} as const;

const FILTERS = [
  { id: "building", label: "建物" },
  { id: "food", label: "食堂" },
  { id: "shop", label: "売店" },
  { id: "tips", label: "ヒント" },
] as const;

type Props = {
  /** 制御付きで使う場合の選択値 */
  value?: string[];
  /** 制御付きで使う場合の変更ハンドラ */
  onChange?: (vals: string[]) => void;
  /** 非制御の初期値（省略時は []） */
  className?: string;
};

export function CalmFilterToggleGroup({ value, onChange, className }: Props) {
  // 制御/非制御の両対応:
  const isControlled = value !== undefined;
  const { state, dispatch } = useMapContext();

  const [inner, setInner] = React.useState<string[]>(
    Object.entries(state.filter)
      .filter(([_, v]) => v)
      .map(([k]) => k)
  );
  const selected = isControlled ? value! : inner;

  const handleChange = (vals: string[]) => {
    // 親に通知
    onChange?.(vals);
    // 非制御のときだけ内部 state を更新
    if (!isControlled) setInner(vals);
    const paralel: Partial<FilterState> = {
      building: vals.includes("building"),
      food: vals.includes("food"),
      shop: vals.includes("shop"),
      tips: vals.includes("tips"),
    };
    dispatch({ type: "SET_FILTER", payload: paralel });
  };

  return (
    <ToggleGroup
      type="multiple"
      value={selected}
      onValueChange={handleChange}
      className={`flex flex-wrap gap-2 ${className ?? ""}`}
      style={{
        paddingLeft: 8,
      }}
    >
      {FILTERS.map((f) => {
        const isOn = selected.includes(f.id);
        const c = ON_COLORS[f.id];

        const style: React.CSSProperties = {
          borderRadius: 9999, // pill
          height: 24, // h-6
          paddingInline: 10, // px-3
          fontSize: 12, // text-xs
          fontWeight: 500, // font-medium
          borderWidth: 1,
          borderStyle: "solid",
          backgroundColor: isOn ? c.bg : "rgba(0,0,0,0.04)",
          color: isOn ? c.text : "var(--foreground, #0B1220)",
          borderColor: isOn ? "transparent" : "var(--border, #E5E7EB)",
          boxShadow: isOn && c.ring ? `0 0 0 2px ${c.ring}` : undefined,
          filter: isOn
            ? "drop-shadow(0 1px 0.5px rgba(0,0,0,0.06))"
            : undefined,
          transition:
            "background-color .15s ease, color .15s ease, box-shadow .15s ease",
          // クリックできない事故を避けるため display/position は既定に任せる
        };

        return (
          <ToggleGroupItem
            key={f.id}
            value={f.id}
            aria-label={f.label}
            className="inline-flex items-center"
            style={style}
            onMouseDown={(e) => {
              // クリック時にフォーカスを防ぐ
              e.preventDefault();
            }}
          >
            {f.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
