import { Building2, Coffee, Lightbulb, ShoppingBag } from "lucide-react";
import { Facility, PinCategory } from "./types/map-type";

export const KYOTO_BOUNDS: [number, number, number, number] = [
  135.7541779, 35.0662063, 135.7608528, 35.0728644,
];

// export const KYOTO_BOUNDS: [number, number, number, number] = [
//   135, 34, 135.7608528, 35.0728644,
// ];

export const DEFAULT_CENTER: [number, number] = [135.7585, 35.0705];

export const DEFAULT_ZOOM = 18;

export const PIXEL_SCALE = 256;

export const DRAWER_PERCENTAGE = 0.45;

export const HEAD_PX = 70; // ハンドル＋ヘッダの高さ

export const ALL_PINS: Facility[] = [
  {
    id: "building_1",
    name: "京都駅ビル",
    type: "building",
    lat: 35.069,
    lng: 135.758,
  },
  {
    id: "shop_1",
    name: "お土産屋さん",
    type: "shop",
    lat: 35.0702,
    lng: 135.7592,
  },
  {
    id: "food_1",
    name: "京料理 鴨川亭",
    type: "food",
    lat: 35.071,
    lng: 135.7568,
  },
  {
    id: "tips_1",
    name: "観光案内所",
    type: "tips",
    lat: 35.0683,
    lng: 135.7574,
  },
];

export const CATEGORY_CARD_STYLE: Record<
  PinCategory,
  { ring: string; accent: string; dot: string }
> = {
  building: { ring: "#e3eefc", accent: "#eef4ff", dot: "#4285F4" },
  shop: { ring: "#e7f5ec", accent: "#eff8f2", dot: "#34A853" },
  food: { ring: "#fff5db", accent: "#fff8e6", dot: "#FBBC05" },
  tips: { ring: "#f1e9ff", accent: "#f6f1ff", dot: "#A142F4" },
} as const;

export const CATEGORY_STYLE: Record<
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
} as const;
