"use client";

import * as React from "react";
import { memo, useEffect, useImperativeHandle, useRef } from "react";
import {
  ControlPosition,
  GeolocateControlInstance,
  GeolocateControlOptions,
  GeolocateErrorEvent,
  GeolocateEvent,
  GeolocateResultEvent,
  useControl,
} from "react-map-gl/maplibre";
import { applyReactStyle } from "./apply-react-style";

export type GeolocateControlProps = GeolocateControlOptions & {
  /** Placement of the control relative to the map. */
  position?: ControlPosition;
  /** CSS style override, applied to the control's container */
  style?: React.CSSProperties;

  /** Called on each Geolocation API position update that returned as success. */
  onGeolocate?: (e: GeolocateResultEvent) => void;
  /** Called on each Geolocation API position update that returned as an error. */
  onError?: (e: GeolocateErrorEvent) => void;
  /** Called on each Geolocation API position update that returned as success but user position
   * is out of map `maxBounds`. */
  onOutOfMaxBounds?: (e: GeolocateResultEvent) => void;
  /** Called when the GeolocateControl changes to the active lock state. */
  onTrackUserLocationStart?: (e: GeolocateEvent) => void;
  /** Called when the GeolocateControl changes to the background state. */
  onTrackUserLocationEnd?: (e: GeolocateEvent) => void;

  onIsTrackWatchStateChange?: (state: boolean) => void;

  /** Ref to access the GeolocateControl instance */
  ref?: React.Ref<GeolocateControlInstance>;
};

function GeolocateControlInner(props: GeolocateControlProps) {
  const { ref, ...controlProps } = props;
  const thisRef = useRef({ props });

  const ctrl = useControl(
    ({ mapLib }) => {
      const gc = new mapLib.GeolocateControl(controlProps);

      // Hack: fix GeolocateControl reuse
      // When using React strict mode, the component is mounted twice.
      // GeolocateControl's UI creation is asynchronous. Removing and adding it back causes the UI to be initialized twice.
      const setupUI = gc._setupUI;
      gc._setupUI = () => {
        if (!gc._container.hasChildNodes()) {
          setupUI();
        }
      };

      const getIsTrackWatchState = () => {
        if (
          gc._geolocationWatchID &&
          (gc._watchState === "BACKGROUND" || gc._watchState === "ACTIVE_LOCK")
        ) {
          return true;
        }
        return false;
      };

      gc.on("geolocate", (e) => {
        const isTracking = getIsTrackWatchState();
        thisRef.current.props.onIsTrackWatchStateChange?.(isTracking);
        thisRef.current.props.onGeolocate?.(e as GeolocateResultEvent);
      });
      gc.on("error", (e) => {
        const isTracking = getIsTrackWatchState();
        thisRef.current.props.onIsTrackWatchStateChange?.(isTracking);
        thisRef.current.props.onError?.(e as GeolocateErrorEvent);
      });
      gc.on("outofmaxbounds", (e) => {
        const isTracking = getIsTrackWatchState();
        thisRef.current.props.onIsTrackWatchStateChange?.(isTracking);
        thisRef.current.props.onOutOfMaxBounds?.(e as GeolocateResultEvent);
      });
      gc.on("trackuserlocationstart", (e) => {
        const isTracking = getIsTrackWatchState();
        thisRef.current.props.onIsTrackWatchStateChange?.(isTracking);
        thisRef.current.props.onTrackUserLocationStart?.(e as GeolocateEvent);
      });
      gc.on("trackuserlocationend", (e) => {
        const isTracking = getIsTrackWatchState();
        thisRef.current.props.onIsTrackWatchStateChange?.(isTracking);
        thisRef.current.props.onTrackUserLocationEnd?.(e as GeolocateEvent);
      });

      return gc;
    },
    { position: controlProps.position }
  );

  thisRef.current.props = props;

  useImperativeHandle(ref, () => ctrl, [ctrl]);

  useEffect(() => {
    applyReactStyle(ctrl._container, controlProps.style);
  }, [ctrl._container, controlProps.style]);

  return null;
}

export const CustomGeolocateControl = memo(GeolocateControlInner);
