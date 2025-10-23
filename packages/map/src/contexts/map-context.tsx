"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { MapRef } from "react-map-gl/maplibre";
import { useImmerReducer } from "use-immer";
import { ALL_PINS } from "../config";
import {
  calculateSortedPins,
  distanceMetersFloor,
  selectAdjustedCenter,
} from "../functions/map-utils";
import {
  MapContextType,
  PinsDistanceOfPointType,
} from "../types/map-state-type";
import { Facility } from "../types/map-type";
import { defaultState, mapReducer } from "./map-reducer";

export const MapContext = createContext<MapContextType | null>(null);

export function MapContextProvider({
  children,
  mapRef,
}: {
  children: React.ReactNode;
  mapRef: MapRef;
}) {
  const llMap = mapRef.getMap();
  const [state, dispatch] = useImmerReducer(mapReducer, defaultState);
  if (!llMap) {
    throw new Error("Map is not initialized");
  }
  const sortedPinIds = useMemo(() => {
    return calculateSortedPins(llMap, state, ALL_PINS);
  }, [llMap, state]);

  const adjustedCenter = useMemo(() => {
    return selectAdjustedCenter(llMap, state);
  }, [llMap, state]);

  const idPinMap = useMemo<ReadonlyMap<string, Omit<Facility, "id">>>(() => {
    const m = new Map<string, Omit<Facility, "id">>();
    for (const p of ALL_PINS) {
      const { id, ...rest } = p;
      m.set(id, rest);
    }
    return m;
  }, []);

  const pinsDistanceOfPoint: PinsDistanceOfPointType = useCallback(
    ((value: { lat: number; lng: number } | null) => {
      if (!value) {
        return sortedPinIds.map((id) => ({ id }));
      }
      const arr = sortedPinIds.map((id) => {
        const p = idPinMap.get(id)!; // 事前に存在が保証されるなら ! でOK
        const distanceMeter = distanceMetersFloor(
          { lat: p.lat, lng: p.lng },
          value
        );
        return { id, distanceMeter };
      });
      arr.sort((a, b) => a.distanceMeter - b.distanceMeter);
      return arr;
    }) as PinsDistanceOfPointType,
    [sortedPinIds, idPinMap]
  );

  const context: MapContextType = useMemo(() => {
    return {
      state,
      dispatch,
      sortedPinIds,
      adjustedCenter,
      pinsDistanceOfPoint,
      idPinMap,
    } satisfies MapContextType;
  }, [
    state,
    dispatch,
    sortedPinIds,
    adjustedCenter,
    pinsDistanceOfPoint,
    idPinMap,
  ]);
  return <MapContext value={context}>{children}</MapContext>;
}

export function MapNullableContextProvider({
  children,
  mapRef,
  isMapLoaded,
  onLoaded,
}: {
  children: React.ReactNode;
  mapRef: MapRef | null;
  isMapLoaded: boolean;
  onLoaded: (loaded: boolean) => void;
}) {
  // ✅ レンダー後に通知する。無限ループ防止に一度だけ発火

  const firedRef = useRef(false);
  useEffect(() => {
    console.log("MapNullableContextProvider useEffect");
    if (!firedRef.current && mapRef && isMapLoaded) {
      firedRef.current = true;
      onLoaded(true);
    }
  }, [mapRef, onLoaded, isMapLoaded]);

  if (firedRef.current && mapRef) {
    return <MapContextProvider mapRef={mapRef}>{children}</MapContextProvider>;
  }
  return <>{children}</>;
}

export function useMapContext(): MapContextType {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapContextProvider");
  }
  return context;
}
