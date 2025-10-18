// utils/map-geo.ts
import type { Map, Point as MlPoint } from "maplibre-gl";
import { Point } from "maplibre-gl";
import type {
  FilterState,
  State,
  ViewPointState,
} from "../types/map-state-type";
import type { Facility } from "../types/map-type";

/**
 * 近距離（~1km）向けの平面近似距離（m）を整数で返す
 */
export function distanceMetersFloor(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6378137; // WGS84
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const latMean = (lat1 + lat2) / 2;
  const dy = dLat * R;
  const dx = dLng * R * Math.cos(latMean);
  return Math.floor(Math.hypot(dx, dy));
}

/**
 * デバッグ/可視化用：その場の 1px あたりの緯度/経度（CSS px 基準）
 * ※ 実際の座標補正には使用しない
 */
export function getDegreesPerPixel(
  map: Map,
  center?: { lat: number; lng: number }
): { lngPerPixel: number; latPerPixel: number } {
  const c = center ?? map.getCenter();
  const p = map.project([c.lng, c.lat]);
  const right = map.unproject(new Point(p.x + 1, p.y) as MlPoint); // 右へ1px
  const up = map.unproject(new Point(p.x, p.y - 1) as MlPoint); // 上へ1px
  return {
    lngPerPixel: right.lng - c.lng,
    latPerPixel: up.lat - c.lat,
  };
}

/**
 * State から “可視領域中心” のピクセルオフセット（CSS px）を求める
 * - モバイル：下モーダル → y: -h/2（上へ）
 * - デスクトップ：左サイドバー → x: +w/2（右へ）
 */
export function cameraOffsetPxFromState(state: State): {
  x: number;
  y: number;
} {
  if (!state.uiVisible) return { x: 0, y: 0 };

  if (state.deviceMode === "mobile") {
    const h = state.uiDimensions.mobile.modalHeight ?? 0;
    return { x: 0, y: -h / 2 };
  } else {
    const w = state.uiDimensions.desktop.sidebarWidth ?? 0;
    return { x: +w / 2, y: 0 };
  }
}

/**
 * UIオフセットを考慮した “見かけの中心” を緯度経度で返す
 * - project/unproject を直接使い、pitch/非線形も吸収
 * - map 未準備時はフォールバックとして補正なしを返す
 */
export function selectAdjustedCenter(
  map: Map,
  state: State
): { lat: number; lng: number } {
  try {
    const offsetPx = cameraOffsetPxFromState(state);
    const centerPx = map.project([
      state.viewport.center.lng,
      state.viewport.center.lat,
    ]);
    const adjusted = map.unproject(
      new Point(centerPx.x + offsetPx.x, centerPx.y + offsetPx.y) as MlPoint
    );
    return { lat: adjusted.lat, lng: adjusted.lng };
  } catch {
    // map が未準備などの例外時は補正なし
    return state.viewport.center;
  }
}

/** フィルタ通過判定（未定義タイプは通す） */
function passFilter(pin: Facility, filter: FilterState): boolean {
  if (!(pin.type in filter)) return true;
  return Boolean(filter[pin.type as keyof FilterState]);
}

/** ビューポート bounds 内判定（IDLまたぎ対応） */
function inBounds(pin: Facility, bounds: ViewPointState["bounds"]): boolean {
  const inLat = bounds.south <= pin.lat && pin.lat <= bounds.north;
  if (!inLat) return false;
  if (bounds.west <= bounds.east) {
    return bounds.west <= pin.lng && pin.lng <= bounds.east;
  }
  // 国際日付変更線またぎ（west > east）
  return pin.lng >= bounds.west || pin.lng <= bounds.east;
}

/**
 * 距離順にソートされた Pin ID 配列を返す
 * - UI補正後中心からの平面距離（m, 整数）で昇順
 * - useViewportBounds=true で画面内のピンだけに絞り込み可
 * - 同距離の安定ソートとして id でタイブレーク
 */
export function calculateSortedPins(
  map: Map,
  state: State,
  allPins: Facility[],
  opts?: { useViewportBounds?: boolean }
): string[] {
  const adjustedCenter = selectAdjustedCenter(map, state);

  const candidates = (
    opts?.useViewportBounds
      ? allPins.filter((p) => inBounds(p, state.viewport.bounds))
      : allPins
  ).filter((p) => passFilter(p, state.filter));

  const withDist = candidates.map((p) => ({
    id: p.id,
    d: distanceMetersFloor({ lat: p.lat, lng: p.lng }, adjustedCenter),
  }));

  withDist.sort(
    (a, b) => a.d - b.d || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
  return withDist.map((x) => x.id);
}
