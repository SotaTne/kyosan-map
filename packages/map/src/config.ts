import { Facility } from "./types/map-type";

export const KYOTO_BOUNDS: [number, number, number, number] = [
  135.7541779, 35.0662063, 135.7608528, 35.0728644,
];

// export const KYOTO_BOUNDS: [number, number, number, number] = [
//   135, 34, 135.7608528, 35.0728644,
// ];

export const DEFAULT_CENTER: [number, number] = [135.7585, 35.0705];

export const DEFAULT_ZOOM = 19;

export const PIXEL_SCALE = 256;

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
