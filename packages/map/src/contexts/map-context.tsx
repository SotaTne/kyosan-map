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
import { Facility, FacilityTableInfo } from "../types/map-type";
import { defaultState, mapReducer } from "./map-reducer";

export const MapContext = createContext<MapContextType | null>(null);

export function MapContextProvider({
  children,
  mapRef,
  defaultFocus,
  uiDimensions = 360,
}: {
  children: React.ReactNode;
  mapRef: MapRef;
  defaultFocus: string | null;
  uiDimensions?: number;
}) {
  const llMap = mapRef.getMap();

  const hasFocusCenter = useMemo(() => {
    if (!defaultFocus) return false;
    const pin = ALL_PINS.find((p) => p.id === defaultFocus);
    return Boolean(pin);
  }, [defaultFocus]);

  const [state, dispatch] = useImmerReducer(mapReducer, {
    ...defaultState,
    uiDimensions: uiDimensions,
    uiVisible: hasFocusCenter,
    focusedPinId: defaultFocus,
  });
  if (!llMap) {
    throw new Error("Map is not initialized");
  }
  const sortedPinIds = useMemo(() => {
    return calculateSortedPins(llMap, state, ALL_PINS);
  }, [llMap, state]);

  const _filteredPins = useMemo(() => {
    return calculateSortedPins(llMap, state, ALL_PINS, {
      useViewportBounds: true,
    });
  }, [llMap, state]);

  const adjustedCenter = useMemo(() => {
    return selectAdjustedCenter(
      llMap,
      state.viewport.center,
      state.uiVisible,
      state.uiDimensions
    );
  }, [llMap, state.viewport.center, state.uiVisible, state.uiDimensions]);

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
        return _filteredPins.map((id) => ({ id }));
      }
      const arr = _filteredPins.map((id) => {
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
    [_filteredPins, idPinMap]
  );

  const setCenterWithPinID = useCallback(
    (pinId: string) => {
      const pin = idPinMap.get(pinId);
      if (!pin) {
        console.warn("Pin not found for id: " + pinId);
        return;
      }
      dispatch({ type: "SET_FOCUSED_PIN_ID", payload: pinId });
      dispatch({ type: "SET_UI_VISIBLE", payload: true });
      // ここでcenterの補正をかける
      const center = selectAdjustedCenter(
        llMap,
        { lat: pin.lat, lng: pin.lng },
        true,
        state.uiDimensions
      );
      console.log("setCenterWithPinID", pinId, center);
      llMap.easeTo({
        center: [center.lng, center.lat],
        duration: 500,
        essential: true,
      });
    },
    [dispatch, idPinMap, llMap, state.uiDimensions]
  );

  const focusedPin = useMemo(() => {
    if (!state.focusedPinId) return null;
    const pinInfo = idPinMap.get(state.focusedPinId);
    if (!pinInfo) return null;
    return {
      id: state.focusedPinId,
      ...pinInfo,
    };
  }, [state.focusedPinId, idPinMap]);

  const _facilities: FacilityTableInfo = useMemo<FacilityTableInfo>(() => {
    if (state.focusedPinId && focusedPin) {
      return {
        mode: "distanceFromSelectedPin",
        selectPinId: state.focusedPinId,
        data: pinsDistanceOfPoint({
          lat: focusedPin.lat,
          lng: focusedPin.lng,
        }),
      } satisfies FacilityTableInfo;
    } else if (state.geolocatePos) {
      return {
        mode: "distanceFromGeolocate",
        data: pinsDistanceOfPoint({
          lat: state.geolocatePos.lat,
          lng: state.geolocatePos.lng,
        }),
      } satisfies FacilityTableInfo;
    } else {
      return {
        mode: "default",
        data: pinsDistanceOfPoint(null),
      } satisfies FacilityTableInfo;
    }
  }, [state.geolocatePos, state.focusedPinId, pinsDistanceOfPoint, focusedPin]);

  const withoutSelectedPinFacilities: FacilityTableInfo =
    useMemo<FacilityTableInfo>(() => {
      if (_facilities.mode === "distanceFromSelectedPin") {
        return {
          mode: "distanceFromSelectedPin",
          selectPinId: _facilities.selectPinId,
          data: _facilities.data.filter(
            (item) => item.id !== state.focusedPinId
          ),
        } satisfies FacilityTableInfo;
      }
      return _facilities;
    }, [_facilities, state.focusedPinId]);

  const context: MapContextType = useMemo(() => {
    return {
      state,
      dispatch,
      sortedPinIds,
      adjustedCenter,
      pinsDistanceOfPoint,
      idPinMap,
      withoutSelectedPinFacilities,
      setCenterWithPinID,
    } satisfies MapContextType;
  }, [
    state,
    dispatch,
    sortedPinIds,
    adjustedCenter,
    pinsDistanceOfPoint,
    idPinMap,
    withoutSelectedPinFacilities,
    setCenterWithPinID,
  ]);
  return <MapContext value={context}>{children}</MapContext>;
}

export function MapNullableContextProvider({
  children,
  mapRef,
  isMapLoaded,
  onLoaded,
  defaultFocusId = null,
  uiDimensions,
}: {
  children: React.ReactNode;
  mapRef: MapRef | null;
  isMapLoaded: boolean;
  onLoaded: (loaded: boolean) => void;
  defaultFocusId?: string | null;
  uiDimensions?: number;
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
    return (
      <MapContextProvider
        mapRef={mapRef}
        defaultFocus={defaultFocusId}
        uiDimensions={uiDimensions}
      >
        {children}
      </MapContextProvider>
    );
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
