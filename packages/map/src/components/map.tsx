"use client";

import { MapLibreEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  AttributionControl,
  //AttributionControl,
  MapProps,
  MapRef,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useDebouncedCallback } from "use-debounce";
import {
  ALL_PINS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  DRAWER_PERCENTAGE,
  KYOTO_BOUNDS,
} from "../config";
import { MapNullableContextProvider } from "../contexts/map-context";
import { selectAdjustedCenter } from "../functions/map-utils";
import { ViewPointState } from "../types/map-state-type";
import { InnerMap } from "./inner-map";
import { PeekDrawer } from "./maps/peekDrawer";
import { SearchBar } from "./search/search-box";
// import { SearchBox } from "./search/search-box";

//import { InnerMap } from "./inner-map";
// import { DrawerDemo } from "./maps/peekDrawer";

export function DeliverMap({
  children,
  loadingNode = null,
  defaultFocus = null,
}: {
  children?: React.ReactNode;
  loadingNode?: React.ReactNode;
  defaultFocus?: string | null;
}) {
  const [onLoaded, setOnLoaded] = useState(false);
  const mapRef = useRef<MapRef | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const vh_100 = window.innerHeight;
  const vw_100 = window.innerWidth;
  const viewHeightSize = vh_100; // ヘッダ等を除いたサイズ
  const viewWidthSize = vw_100; // ヘッダ等を除いたサイズ
  const uiDimensions = Math.floor(viewHeightSize * DRAWER_PERCENTAGE);

  const style = useMemo<React.CSSProperties>(
    () => ({
      width: viewWidthSize + "px",
      height: viewHeightSize + "px",
      position: "fixed",
      top: 0,
      left: 0,
    }),
    [viewHeightSize, viewWidthSize]
  );

  const mapProps: MapProps = useMemo(
    () =>
      ({
        style,
        mapStyle: "https://map-tile-server.pages.dev/style.json",
        maxBounds: KYOTO_BOUNDS,
        initialViewState: {
          longitude: DEFAULT_CENTER[0],
          latitude: DEFAULT_CENTER[1],
          zoom: DEFAULT_ZOOM,
        },
        maxZoom: 20,
        minZoom: 16,
      }) satisfies MapProps,
    [style]
  );

  const handleLoad = useCallback(
    (evt: MapLibreEvent) => {
      setOnLoaded(true);
      const map = evt.target;

      if (!defaultFocus) {
        map.setCenter([DEFAULT_CENTER[0], DEFAULT_CENTER[1]]);
        return;
      }
      const focusPin = ALL_PINS.find((p) => p.id === defaultFocus);
      if (!focusPin) {
        map.setCenter([DEFAULT_CENTER[0], DEFAULT_CENTER[1]]);
        return;
      }
      const pinCenter = { lng: focusPin.lng, lat: focusPin.lat };
      const adjustCenter = selectAdjustedCenter(
        map,
        pinCenter,
        true,
        uiDimensions
      );
      map.setCenter([adjustCenter.lng, adjustCenter.lat]);
    },
    [defaultFocus, uiDimensions]
  );

  const [mapViewPort, setMapViewPort] = useState<ViewPointState>({
    // : DEFAULT_CENTER[0],
    // lat: DEFAULT_CENTER[1],
    center: {
      lng: DEFAULT_CENTER[0],
      lat: DEFAULT_CENTER[1],
    },
    zoom: DEFAULT_ZOOM,
    bounds: {
      north: KYOTO_BOUNDS[3],
      south: KYOTO_BOUNDS[1],
      east: KYOTO_BOUNDS[2],
      west: KYOTO_BOUNDS[0],
    },
  });

  const handleMove = useDebouncedCallback((evt: ViewStateChangeEvent) => {
    const north = evt.target.getBounds().getNorth();
    const south = evt.target.getBounds().getSouth();
    const east = evt.target.getBounds().getEast();
    const west = evt.target.getBounds().getWest();
    const viewPort: ViewPointState = {
      center: {
        lng: evt.viewState.longitude,
        lat: evt.viewState.latitude,
      },
      zoom: evt.viewState.zoom,
      bounds: {
        north,
        south,
        east,
        west,
      },
    };
    setMapViewPort(viewPort);
  }, 100);

  return (
    <MapNullableContextProvider
      mapRef={mapRef.current}
      isMapLoaded={onLoaded}
      onLoaded={setContextLoaded}
      defaultFocusId={defaultFocus}
      uiDimensions={uiDimensions}
    >
      {onLoaded && contextLoaded && (
        <PeekDrawer
          containerStyle={{
            ...style,
            zIndex: 100,
            pointerEvents: "none", // Map操作を妨げないように
          }}
        />
      )}
      {onLoaded && contextLoaded && <SearchBar />}
      <Map
        {...mapProps}
        ref={mapRef}
        onLoad={handleLoad}
        attributionControl={false}
        onMove={(e) => {
          handleMove(e);
        }}
      >
        {onLoaded && contextLoaded && (
          <InnerMap mapViewPort={mapViewPort}>{children}</InnerMap>
        )}
        {onLoaded && contextLoaded && (
          <AttributionControl position="top-right" compact />
        )}
      </Map>
    </MapNullableContextProvider>
  );
}
