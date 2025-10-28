"use client";

import { useMemo } from "react";
import { useMapContext } from "../../contexts/map-context";
import { FacilityTableInfo } from "../../types/map-type";
//import { TwoStateDrawer } from "./facility-drawer-bar";

export function FacilityTable() {
  const { state, pinsDistanceOfPoint, idPinMap } = useMapContext();
  // 選択->現在地->通常の順で優先
  const focusedPin = useMemo(() => {
    if (!state.focusedPinId) return null;
    return idPinMap.get(state.focusedPinId) || null;
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
          mode: _facilities.mode,
          selectPinId: _facilities.selectPinId,
          data: _facilities.data.filter(
            (item) => item.id !== state.focusedPinId
          ),
        } satisfies FacilityTableInfo;
      }
      return _facilities;
    }, [_facilities, state.focusedPinId]);

  console.log("FacilityTable render", {
    _facilities,
    withoutSelectedPinFacilities,
  });

  return (
    <div>
      {/*index -y を地図の上になるようにする */}
      <div>モード: {withoutSelectedPinFacilities.mode}</div>
      <div>フォーカス中の施設: {focusedPin?.name}</div>
      {withoutSelectedPinFacilities.data.map((item) => (
        <div key={item.id}>
          {idPinMap.get(item.id)?.name} -{" "}
          {"distanceMeter" in item && item.distanceMeter !== undefined
            ? `${item.distanceMeter}m`
            : "不明"}
        </div>
      ))}
    </div>
  );
}
