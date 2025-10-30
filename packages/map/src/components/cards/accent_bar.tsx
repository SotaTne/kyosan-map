import { CATEGORY_CARD_STYLE } from "../../config";
import { PinCategory } from "../../types/map-type";

export function AccentBar({
  category,
  height = 80,
}: {
  category: PinCategory;
  height?: number;
}) {
  const { accent, ring } = CATEGORY_CARD_STYLE[category];
  console.log("AccentBar render", { category });
  return (
    <div
      className="flex-none w-1.5 rounded-full"
      aria-hidden
      style={{
        height,
        width: 4,
        background: accent,
        boxShadow: `inset 0 0 0 1px ${ring}`,
      }}
    />
  );
}
