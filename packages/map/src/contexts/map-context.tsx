"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useImmerReducer } from "use-immer";
import { ALL_PINS } from "../config";
import { calculateSortedPins, distanceMetersFloor, selectAdjustedCenter } from "../functions/map-utils";
import { MapContextType } from "../types/map-state-type";
import { defaultState, mapReducer } from "./map-reducer";

export const MapContext = createContext<MapContextType | null>(null);

export function MapContextProvider({ children }: { children: React.ReactNode }) {
  const map = useMap();
  const llMap = map.current?.getMap();
  const [state, dispatch] = useImmerReducer(mapReducer,defaultState);
  if (!llMap) {
    throw new Error("Map is not initialized");
  }
  const sortedPinIds = useMemo(()=>{
    return calculateSortedPins(llMap, state, ALL_PINS);
  }, [llMap, state]);

  const adjustedCenter = useMemo(()=>{
    return selectAdjustedCenter(llMap, state);
  }, [llMap, state]);

  const idToPin = useMemo(() => {
    const m = new Map<string, { lat: number; lng: number }>();
    for (const p of ALL_PINS) m.set(p.id, { lat: p.lat, lng: p.lng });
    return m;
  }, []);

  const pinsDistanceOfPoint = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      const arr = sortedPinIds.map((id) => {
        const pin = idToPin.get(id);
        if (!pin) return { id, distanceMeter: Number.POSITIVE_INFINITY };
        const distanceMeter = distanceMetersFloor(pin, { lat, lng });
        return { id, distanceMeter };
      });
      arr.sort((a, b) => a.distanceMeter - b.distanceMeter);
      return arr;
    },
    [sortedPinIds, idToPin]
  );
  
  const context:MapContextType = useMemo(()=>{
    return {
      state,
      dispatch,
      sortedPinIds,
      adjustedCenter,
      pinsDistanceOfPoint,
    } satisfies MapContextType;
  },[state, dispatch, sortedPinIds, adjustedCenter, pinsDistanceOfPoint]);
  return (
    <MapContext value={context}>
      {children}
    </MapContext>
  )
}

export function useMapContext():MapContextType {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapContextProvider");
  }
  return context;
}