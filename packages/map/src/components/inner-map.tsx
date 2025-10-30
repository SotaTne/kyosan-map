"use client";

import { useEffect } from "react";
import { useMapContext } from "../contexts/map-context";
import { ViewPointState } from "../types/map-state-type";
import { GeolocateControlDeliver } from "./maps/geometory-controle-deliver";
import { PinsDeliver } from "./maps/pins-deliver";

export function InnerMap({
  children,
  mapViewPort,
}: {
  children?: React.ReactNode;
  mapViewPort: ViewPointState;
}) {
  console.log("InnerMap rendered");
  const { dispatch } = useMapContext();
  useEffect(() => {
    dispatch({
      type: "SET_VIEWPORT",
      payload: mapViewPort,
    });
  }, [dispatch, mapViewPort]);
  return (
    <>
      <GeolocateControlDeliver />
      {/* ここにPinが来る */}
      <PinsDeliver />
      {/* ここに、ドロワーもしくはサイドバーが来る */}
      {children}
    </>
  );
}
