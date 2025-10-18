"use client";

import { MapLibreEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useState } from "react";
import Map, {
  GeolocateControl,
  ImmutableLike,
  MapProps,
  StyleSpecification
} from "react-map-gl/maplibre";
import data from "../../building.json" with { type: "json" };
import { DEFAULT_CENTER, KYOTO_BOUNDS } from "../config";

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
      maxBounds: KYOTO_BOUNDS,
      maxZoom: 20,
      minZoom: 16,
    } satisfies MapProps),
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
      map.setCenter(DEFAULT_CENTER);
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

      {children}
    </Map>
  );
}