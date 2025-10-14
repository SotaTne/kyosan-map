"use client";

import { MapLibreEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useState } from "react";
import Map, {
  GeolocateControl,
  ImmutableLike,
  MapProps,
  Marker,
  StyleSpecification,
} from "react-map-gl/maplibre";
import data from "../../building.json" with { type: "json" };

/* 初期スタイル */
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
    { id: "background", type: "background", paint: { "background-color": "#ddeeff" } },
  ],
};

const KYOTO_BOUNDS: [number, number, number, number] = [
  135.7541779, 35.0662063, 135.7608528, 35.0728644,
];

const CENTER: [number, number] = [135.7585, 35.0705];

/* ---- 追加: ピン用の簡単なSVG ---- */
function Pin({ size = 24, color = "#e11d48" }: { size?: number; color?: string }) {
  const ICON =
    "M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3 c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9 C20.1,15.8,20.2,15.8,20.2,15.7z";
  return (
    <svg height={size} viewBox="0 0 24 24" style={{ cursor: "pointer", fill: color, stroke: "none" }}>
      <path d={ICON} />
    </svg>
  );
}

/* ---- 追加: ピンを出す対象（例） ---- */
type Facility = { id: string; name: string; lat: number; lng: number; type?: "building"|"food"|"shop"|"tips" };
const FACILITIES: Facility[] = [
  { id: "b001", name: "RIT本館", lat: 35.0705, lng: 135.7585, type: "building" },
  { id: "f001", name: "カフェ",   lat: 35.0709, lng: 135.7593, type: "food" },
  { id: "s001", name: "ストア",   lat: 35.0712, lng: 135.7589, type: "shop" },
];

export function DeliverMap({
  children,
  style = { width: "100vw", height: "100vh" },
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [mapStyle, setMapStyle] = useState<
    string | StyleSpecification | ImmutableLike<StyleSpecification> | undefined
  >(DefaultStyle);

  const mapProps: MapProps = useMemo(
    () => ({
      style,
      mapStyle,
      center: CENTER,
      maxBounds: KYOTO_BOUNDS,
      maxZoom: 20,
      minZoom: 16,
      defaultZoom: 19,
    }),
    [style, mapStyle]
  );
  console.log(data);

  const handleLoad = useCallback((evt: MapLibreEvent) => {
    const map = evt.target;

    map.setStyle("https://map-tile-server.pages.dev/style.json", {
      transformStyle: (prev, next) => {
        if (!prev) throw new Error("prev is undefined");
        const newStyle: StyleSpecification = {
          ...prev,
          layers: [...next.layers],
        };
        setMapStyle(newStyle);
        return newStyle;
      },
    });

    map.once("styledata", () => {
      map.setCenter(CENTER);
    });
  }, []);

  return (
    <Map {...mapProps} onLoad={handleLoad}>
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        onGeolocate={(e) => {
          console.log(
            "[Geolocate] lat, lng, ±acc(m):",
            e.coords.latitude,
            e.coords.longitude,
            e.coords.accuracy
          );
        }}
        onOutOfMaxBounds={(e) => {
          console.warn("[Geolocate] out of maxBounds", e);
          alert("現在地がキャンパス範囲外です（maxBounds）。");
        }}
        onError={(e) => {
          console.error("[Geolocate error]", e);
          alert(
            "位置情報が取得できませんでした。\n" +
              "・HTTPSでアクセスしていますか？\n" +
              "・ブラウザの位置情報許可は有効ですか？\n" +
              "・iOS Safariは初回クリックが必要な場合があります。"
          );
        }}
      />

      {/* ---- 追加: ピン描画（Marker） ---- */}
      {FACILITIES.map((f) => (
        <Marker key={f.id} longitude={f.lng} latitude={f.lat} anchor="bottom">
          <Pin
            color={
              f.type === "building" ? "#2563eb" : // blue-600
              f.type === "food"     ? "#ef4444" : // red-500
              f.type === "shop"     ? "#f59e0b" : // amber-500
                                      "#8b5cf6"   // violet-500 (tips/その他)
            }
          />
        </Marker>
      ))}

      {children}
    </Map>
  );
}