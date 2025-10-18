import { Dispatch } from "react";
import { Action } from "../contexts/map-reducer";

export interface FilterState {
  shop: boolean;
  building: boolean;
  food: boolean;
  tips: boolean;
}

export interface ViewPointState {
  center: { lat: number; lng: number };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom?: number;  // あると便利（オプション）
};

export interface UiDimensionsState {
  mobile: { modalHeight?: number };
  desktop: { sidebarWidth?: number };
};


export interface State {
  /** デバイスモード */
  deviceMode: "desktop" | "mobile";

  /** UI表示状態 */
  uiVisible: boolean;

  /** UIの実測寸法（レイアウト計測後に設定） */
  uiDimensions: UiDimensionsState;

  /** フィルタ状態 */
  filter:FilterState

  /** フォーカス中のPinのID */
  focusedPinId: string | null;

  /** ビューポート（0.5秒ごとに更新） */
  viewport: ViewPointState

  //cameraOffsetとsortedPinsはuseMemoで計算するContextから提供する値とする
}

export type MapContextType = {
  state:State;
  dispatch:Dispatch<Action>;
  sortedPinIds:string[];
  adjustedCenter:{ lat: number; lng: number; };
  pinsDistanceOfPoint: ({lat,lng}:{lat:number, lng:number})=>{ id:string; distanceMeter:number }[];
}