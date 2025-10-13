"use client";

import { MapLibreEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import Map, { ImmutableLike, StyleSpecification } from "react-map-gl/maplibre";

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
  135.7531779, 35.0652063, 135.7638528, 35.0758644,
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

  const mapProps = useMemo(
    () => ({
      style,
      mapStyle,
      maxBounds: KYOTO_BOUNDS,
      maxZoom: 20,
      minZoom: 16,
    }),
    [style, mapStyle]
  );

  const handleLoad = useCallback(
    (evt: MapLibreEvent) => {
      const map = evt.target;
      map.setStyle("https://map-tile-server.pages.dev/style.json", {
        transformStyle: (prev, next) => {
          if (!prev) throw new Error("prev is undefined");
          const newStyle: StyleSpecification = { ...prev, layers: next.layers };
          setMapStyle(newStyle);
          return newStyle;
        },
      });
    },
    [setMapStyle]
  );

  useEffect(() => {
    console.log("[DeliverMap] style updated:", mapStyle);
  }, [mapStyle]);

  return (
    <Map {...mapProps} onLoad={handleLoad}>
      {children}
    </Map>
  );
}