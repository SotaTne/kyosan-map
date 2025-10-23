"use client";

import { MapLibreEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  AttributionControl,
  MapProps,
  MapRef,
} from "react-map-gl/maplibre";
import { DEFAULT_CENTER, DEFAULT_ZOOM, KYOTO_BOUNDS } from "../config";
import { MapNullableContextProvider } from "../contexts/map-context";
import { InnerMap } from "./inner-map";
import { PeekDrawer } from "./maps/peekDrawer";
// import { DrawerDemo } from "./maps/peekDrawer";

export function DeliverMap({
  children,
  loadingNode = null,
  style = {
    width: "100vw",
    height: "100vh",
    position: "fixed",
    inset: 0,
    zIndex: 0,
  },
}: {
  children?: React.ReactNode;
  loadingNode?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const [onLoaded, setOnLoaded] = useState(false);
  const mapRef = useRef<MapRef | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);

  const mapProps: MapProps = useMemo(
    () =>
      ({
        style,
        mapStyle: "https://map-tile-server.pages.dev/style.json",
        maxBounds: KYOTO_BOUNDS,
        maxZoom: 20,
        minZoom: 16,
      }) satisfies MapProps,
    [style]
  );

  const handleLoad = useCallback((evt: MapLibreEvent) => {
    const map = evt.target;
    console.log("Map loaded");
    map.setCenter(DEFAULT_CENTER);
    map.setZoom(DEFAULT_ZOOM);
    setOnLoaded(true);
  }, []);

  return (
    <MapNullableContextProvider
      mapRef={mapRef.current}
      isMapLoaded={onLoaded}
      onLoaded={setContextLoaded}
    >
      <PeekDrawer />

      <Map
        {...mapProps}
        ref={mapRef}
        onLoad={handleLoad}
        attributionControl={false}
      >
        <AttributionControl position="top-right" compact />
        {onLoaded && contextLoaded && <InnerMap>{children}</InnerMap>}
      </Map>

      {/* Map の外側だが MapNullableContextProvider の中 */}
      {/* {onLoaded && contextLoaded && (
        <>
          <div
            style={{
              position: "fixed",
              top: 10,
              left: 10,
              zIndex: 1000,
              background: "blue",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <FacilityTable />
          </div>
        </>
      )} */}
    </MapNullableContextProvider>
  );
}
