"use client";

import { useMemo } from "react";
import { useMapContext } from "../../contexts/map-context";
import { FacilityTableInfo } from "../../types/map-type";
//import { TwoStateDrawer } from "./facility-drawer-bar";

export function FacilityTable() {
  const { state, pinsDistanceOfPoint, idPinMap } = useMapContext();
  const focusedPin = useMemo(() => {
    if (!state.focusedPinId) return null;
    return idPinMap.get(state.focusedPinId) || null;
  }, [state.focusedPinId, idPinMap]);
  const facilities: FacilityTableInfo = useMemo<FacilityTableInfo>(() => {
    if (state.geolocatePos) {
      return {
        mode: "distanceFromGeolocate",
        data: pinsDistanceOfPoint({
          lat: state.geolocatePos.lat,
          lng: state.geolocatePos.lng,
        }),
      } satisfies FacilityTableInfo;
    } else if (state.focusedPinId && focusedPin) {
      return {
        mode: "distanceFromSelectedPin",
        data: pinsDistanceOfPoint({
          lat: focusedPin.lat,
          lng: focusedPin.lng,
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
      if (facilities.mode === "distanceFromSelectedPin") {
        return {
          mode: facilities.mode,
          data: facilities.data.filter(
            (item) => item.id !== state.focusedPinId
          ),
        } satisfies FacilityTableInfo;
      }
      return facilities;
    }, [facilities, state.focusedPinId]);

  console.log("FacilityTable render", {
    facilities,
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
