"use client";

import { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import { useMapContext } from "../../contexts/map-context";
import { MapPin } from "./pin";

export function PinsDeliver() {
  const { state, sortedPinIds, idPinMap, dispatch, setCenterWithPinID } =
    useMapContext();

  // const facilities: { id: string; distanceMeter: number }[] | { id: string }[] =
  //   useMemo(() => {
  //     return state.geolocatePos
  //       ? pinsDistanceOfPoint({
  //           lat: state.geolocatePos.lat,
  //           lng: state.geolocatePos.lng,
  //         })
  //       : pinsDistanceOfPoint(state.geolocatePos);
  //   }, [state.geolocatePos, pinsDistanceOfPoint]);

  const selectedFacilityId = state.focusedPinId;

  const pins = useMemo(() => {
    return sortedPinIds.map((pinId) => {
      const facility = idPinMap.get(pinId);
      if (!facility) throw new Error("Facility not found for pinId: " + pinId);
      return (
        <div key={pinId}>
          <Marker
            longitude={facility.lng}
            latitude={facility.lat}
            onClick={() => {
              setCenterWithPinID(pinId);
            }}
          >
            <MapPin
              category={facility.type}
              title={facility.name}
              active={pinId === selectedFacilityId}
            />
          </Marker>
        </div>
      );
    });
  }, [idPinMap, selectedFacilityId, setCenterWithPinID, sortedPinIds]);

  return <>{pins}</>;
}
