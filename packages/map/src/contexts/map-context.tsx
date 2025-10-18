"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useImmerReducer } from "use-immer";
import { ALL_PINS } from "../config";
import {
  calculateSortedPins,
  distanceMetersFloor,
  selectAdjustedCenter,
} from "../functions/map-utils";
import { MapContextType } from "../types/map-state-type";
import { Facility } from "../types/map-type";
import { defaultState, mapReducer } from "./map-reducer";

export const MapContext = createContext<MapContextType | null>(null);

export function MapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const map = useMap();
  const llMap = map.current?.getMap();
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

  const idToPin = useMemo<ReadonlyMap<string, Omit<Facility, "id">>>(() => {
    const m = new Map<string, Omit<Facility, "id">>();
    for (const p of ALL_PINS) {
      const { id, ...rest } = p;
      m.set(id, rest);
    }
    return m;
  }, []);

  const pinsDistanceOfPoint = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      const arr = sortedPinIds.map((id) => {
        const pinWithoutId = idToPin.get(id);
        // まずあり得ない
        if (!pinWithoutId) throw new Error("Pin not found for id: " + id);
        const distanceMeter = distanceMetersFloor(
          { lat: pinWithoutId.lat, lng: pinWithoutId.lng },
          { lat, lng }
        );
        return { id, distanceMeter, ...pinWithoutId };
      });
      arr.sort((a, b) => a.distanceMeter - b.distanceMeter);
      return arr;
    },
    [sortedPinIds, idToPin]
  );

  const context: MapContextType = useMemo(() => {
    return {
      state,
      dispatch,
      sortedPinIds,
      adjustedCenter,
      pinsDistanceOfPoint,
    } satisfies MapContextType;
  }, [state, dispatch, sortedPinIds, adjustedCenter, pinsDistanceOfPoint]);
  return <MapContext value={context}>{children}</MapContext>;
}

export function useMapContext(): MapContextType {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapContextProvider");
  }
  return context;
}
