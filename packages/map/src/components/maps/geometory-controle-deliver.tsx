"use client";

import { useCallback } from "react";
import { GeolocateResultEvent } from "react-map-gl/maplibre";
import { CustomGeolocateControl } from "../../_components/custom-geolocate-control";
import { useMapContext } from "../../contexts/map-context";

export function GeolocateControlDeliver() {
  const { dispatch } = useMapContext();

  const handleOnGeolocate = useCallback(
    (e: GeolocateResultEvent) => {
      // geolocateイベント = 確実に位置取得成功
      // このイベント自体が「現在地が取得できた」ことを意味する
      dispatch({
        type: "SET_GEOLOCATE_POS",
        payload: {
          lat: e.coords.latitude,
          lng: e.coords.longitude,
        },
      });
    },
    [dispatch]
  );

  const handleTrackingChange = useCallback(
    (isTracking: boolean) => {
      // 追跡停止 = 「現在地が取得できていない」状態に戻る
      if (!isTracking) {
        dispatch({
          type: "SET_GEOLOCATE_POS",
          payload: null,
        });
      }
    },
    [dispatch]
  );

  const handleError = useCallback(() => {
    // エラー = 現在地取得失敗
    dispatch({
      type: "SET_GEOLOCATE_POS",
      payload: null,
    });
  }, [dispatch]);

  const handleOutOfBounds = useCallback(() => {
    // 範囲外 = 使用できる位置情報ではない
    dispatch({
      type: "SET_GEOLOCATE_POS",
      payload: null,
    });
  }, [dispatch]);

  return (
    <CustomGeolocateControl
      trackUserLocation
      positionOptions={{ enableHighAccuracy: true }}
      onGeolocate={handleOnGeolocate}
      onIsTrackWatchStateChange={handleTrackingChange}
      onOutOfMaxBounds={handleOutOfBounds}
      onError={handleError}
    />
  );
}
