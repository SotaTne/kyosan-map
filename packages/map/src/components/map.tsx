"use client";

import { MapLibreEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useState } from "react";
import Map, {
  GeolocateResultEvent,
  ImmutableLike,
  MapProps,
  StyleSpecification,
} from "react-map-gl/maplibre";
import data from "../../building.json" with { type: "json" };
import { CustomGeolocateControl } from "../_components/custom-geolocate-control";
import { DEFAULT_CENTER, KYOTO_BOUNDS } from "../config";
import { MapContextProvider, useMapContext } from "../contexts/map-context";

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
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#ddeeff" },
    },
  ],
};

export function DeliverMap({
  children,
  loadingNode = null,
  style = { width: "100vw", height: "100vh" },
}: {
  children?: React.ReactNode;
  loadingNode?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [mapStyle, setMapStyle] = useState<
    string | StyleSpecification | ImmutableLike<StyleSpecification> | undefined
  >(DefaultStyle);

  const [onLoaded, setOnLoaded] = useState(false);

  const mapProps: MapProps = useMemo(
    () =>
      ({
        style,
        mapStyle,
        maxBounds: KYOTO_BOUNDS,
        maxZoom: 20,
        minZoom: 16,
      }) satisfies MapProps,
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
      setOnLoaded(true);
    });
  }, []);

  return (
    <Map {...mapProps} onLoad={handleLoad}>
      {!onLoaded ? (
        loadingNode
      ) : (
        <MapContextProvider>
          <InnerMap>{children}</InnerMap>
        </MapContextProvider>
      )}
    </Map>
  );
}

function InnerMap({ children }: { children?: React.ReactNode }) {
  const { dispatch } = useMapContext();

  const handleOnGeolocate = useCallback(
    (e: GeolocateResultEvent) => {
      // geolocateイベント = 確実に位置取得成功
      // このイベント自体が「現在地が取得できた」ことを意味する
      dispatch({
        type: "SET_GEOLOCATE_POS",
        payload: {
          lat: e.coords.latitude,
          lng: e.coords.longitude,
        },
      });
    },
    [dispatch]
  );

  const handleTrackingChange = useCallback(
    (isTracking: boolean) => {
      // 追跡停止 = 「現在地が取得できていない」状態に戻る
      if (!isTracking) {
        dispatch({
          type: "SET_GEOLOCATE_POS",
          payload: null,
        });
      }
    },
    [dispatch]
  );

  const handleError = useCallback(() => {
    // エラー = 現在地取得失敗
    dispatch({
      type: "SET_GEOLOCATE_POS",
      payload: null,
    });
  }, [dispatch]);

  const handleOutOfBounds = useCallback(() => {
    // 範囲外 = 使用できる位置情報ではない
    dispatch({
      type: "SET_GEOLOCATE_POS",
      payload: null,
    });
  }, [dispatch]);

  return (
    <>
      <CustomGeolocateControl
        trackUserLocation
        positionOptions={{ enableHighAccuracy: true }}
        onGeolocate={handleOnGeolocate}
        onIsTrackWatchStateChange={handleTrackingChange}
        onOutOfMaxBounds={handleOutOfBounds}
        onError={handleError}
      />
      {children}
    </>
  );
}
