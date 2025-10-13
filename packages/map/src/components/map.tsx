"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Map, {
  ImmutableLike,
  StyleSpecification,
  useMap,
} from "react-map-gl/maplibre";

/* =========================================================
 * 🎨 初期スタイル（安全なローカルフォールバック）
 * ========================================================= */
const DefaultStyle: StyleSpecification = {
  version: 8,
  sources: {
    openmaptiles: {
      type: "vector",
      tiles: ["https://map-tile-server.pages.dev/tiles/{z}/{x}/{y}.pbf"],
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://openmaptiles.org/">OpenMapTiles</a>',
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#ddeeff" },
    },
  ],
};

/* =========================================================
 * 🌐 表示範囲（京都中心）
 * ========================================================= */
const KYOTO_BOUNDS: [number, number, number, number] = [
  135.7531779, 35.0652063, 135.7638528, 35.0758644,
];

/* =========================================================
 * 🧩 InnerMap
 *   MapLibre インスタンス操作専用（命令的ロジックのみ）
 * ========================================================= */
function InnerMap({
  setMapStyle,
  children,
}: {
  setMapStyle: Dispatch<
    SetStateAction<
      string | StyleSpecification | ImmutableLike<StyleSpecification> | undefined
    >
  >;
  children?: React.ReactNode;
}): ReactNode {
  const map = useMap();

  // transformStyleロジックをuseCallback化（安定参照）
  const transformAndSetStyle = useCallback(() => {
    const mapRef = map.current;
    if (!mapRef) return;
    const unsafeMap = mapRef.getMap();

    unsafeMap.setStyle("https://map-tile-server.pages.dev/style.json", {
      transformStyle: (prev, next) => {
        if (!prev) throw new Error("prev is undefined");

        const newStyle: StyleSpecification = {
          ...prev,
          // 重要: 既存のsources/glyphs/spriteを維持せず、差し替えを優先
          layers: next.layers,
        };

        // React 側にも同期
        setMapStyle(newStyle);
        return newStyle;
      },
    });
  }, [map, setMapStyle]);

  useEffect(() => {
    transformAndSetStyle();
  }, [transformAndSetStyle]);

  return <>{children}</>;
}

/* =========================================================
 * 🗺️ DeliverMap
 *   宣言的UI層（状態・外部からのprops制御）
 * ========================================================= */
export function DeliverMap({ children }: { children?: React.ReactNode }) {
  // 🧠 React側で管理するmapStyle
  const [mapStyle, setMapStyle] = useState<
    string | StyleSpecification | ImmutableLike<StyleSpecification> | undefined
  >(DefaultStyle);

  // useMemoで初期設定を固定化
  const mapProps = useMemo(
    () => ({
      style: { width: "100vw", height: "100vh" },
      mapStyle,
      maxBounds: KYOTO_BOUNDS,
      maxZoom: 20,
      minZoom: 16,
    }),
    [mapStyle]
  );

  // 状態変化ログ（デバッグ用）
  useEffect(() => {
    console.log("[DeliverMap] style updated:", mapStyle);
  }, [mapStyle]);

  return (
    <Map {...mapProps}>
      <InnerMap setMapStyle={setMapStyle}>{children}</InnerMap>
    </Map>
  );
}