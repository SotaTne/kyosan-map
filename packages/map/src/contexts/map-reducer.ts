"use client";

import type { ImmerReducer } from "use-immer";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "../config";
import { FilterState, State, ViewPointState } from "../types/map-state-type";

// やること
// mapでは状態が暗黙かされているが、Pinのレンダリングなどはできる
// ここでは、
// - フィルタリングの状態(shop,building,food,...)
// - フォーカスされているPinのid
// - 現在の表示範囲(0.5秒ごとに更新)
// - 現在の中央(0.5秒ごとに更新)
// - サイドバー(PC)/モーダル(Mobile)の開閉状況
// - デバイスがサイドバーかモーダルのどちらを採用しているかと、そのサイズ
// - デバイスがモバイルだった時にモーダルを開いた後の中心位置とMapの表示領域ないの中心位置の差分/PCだった時にサイドバーを開いた後の中心位置とMapの表示領域ないの中心位置の差分
// - 中央からの距離順(モーダルやサイドバーが開かれているなら、その分を考慮した距離)でソートされたPinのidの配列

const defaultFilterState: FilterState = {
  shop: true,
  building: true,
  food: true,
  tips: true,
};

export const defaultViewPointState: ViewPointState = {
  center: {
    lng: DEFAULT_CENTER[0],
    lat: DEFAULT_CENTER[1],
  },
  bounds: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  zoom: DEFAULT_ZOOM,
};

export const defaultState: State = {
  deviceMode: "desktop",
  uiVisible: true,
  uiDimensions: {
    mobile: {},
    desktop: {},
  },
  filter: defaultFilterState,
  focusedPinId: "tips_1",
  viewport: defaultViewPointState,
  geolocatePos: null,
};

export type Action =
  | {
      type: "SET_DEVICE_MODE";
      payload:
        | { device: "desktop"; sidebarWidth: number }
        | { device: "mobile"; modalHeight: number };
    }
  | {
      type: "SET_UI_VISIBLE";
      payload: boolean;
    }
  | {
      type: "SET_FILTER";
      payload: Partial<FilterState>;
    }
  | {
      type: "SET_FOCUSED_PIN_ID";
      payload: string | null;
    }
  | {
      type: "SET_VIEWPORT";
      payload: ViewPointState;
    }
  | {
      type: "TOGGLE_UI_VISIBLE";
    }
  | {
      type: "SET_GEOLOCATE_POS";
      payload: { lat: number; lng: number } | null;
    };

export const mapReducer: ImmerReducer<State, Action> = (draft, action) => {
  switch (action.type) {
    case "SET_DEVICE_MODE":
      draft.deviceMode = action.payload.device;
      if (action.payload.device === "desktop") {
        draft.uiDimensions.desktop.sidebarWidth = action.payload.sidebarWidth;
        draft.uiDimensions.mobile.modalHeight = undefined;
      } else {
        draft.uiDimensions.mobile.modalHeight = action.payload.modalHeight;
        draft.uiDimensions.desktop.sidebarWidth = undefined;
      }
      return;
    case "SET_UI_VISIBLE":
      draft.uiVisible = action.payload;
      return;
    case "SET_FILTER":
      draft.filter = { ...action.payload, ...draft.filter };
      return;
    case "SET_FOCUSED_PIN_ID":
      draft.focusedPinId = action.payload;
      return;
    case "SET_VIEWPORT":
      draft.viewport = action.payload;
      return;
    case "TOGGLE_UI_VISIBLE":
      draft.uiVisible = !draft.uiVisible;
      return;
    case "SET_GEOLOCATE_POS":
      draft.geolocatePos = action.payload;
      return;
  }
};
