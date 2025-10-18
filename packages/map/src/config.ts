import { Facility } from "./types/map-type";

export const KYOTO_BOUNDS: [number, number, number, number] = [
  135.7541779, 35.0662063, 135.7608528, 35.0728644,
];

export const DEFAULT_CENTER: [number, number] = [135.7585, 35.0705];

export const DEFAULT_ZOOM = 19;

export const PIXEL_SCALE = 256;

export const ALL_PINS:Facility[] = [
  {
    id: "building_1",
    name: "京都駅ビル",
    type: "building",
    lat: 35.031994,
    lng: 135.755607,
  },
  {
    id: "shop_1",
    name: "お土産屋さん",
    type: "shop",
    lat: 35.0325,
    lng: 135.756,
  }
]