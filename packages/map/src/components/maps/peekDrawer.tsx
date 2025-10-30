"use client";

import { distanceMetersFloor } from "@kyosan-map/map/functions/map-utils";
import { Root as VisualHiddenRoot } from "@radix-ui/react-visually-hidden";
import { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import { HEAD_PX } from "../../config";
import { useMapContext } from "../../contexts/map-context";
import { CardProps, Facility, SelectedCardProps } from "../../types/map-type";
import { NormalCard } from "../cards/normal_card";
import { SelectCard } from "../cards/select_card";
import { CalmFilterToggleGroup } from "./toggle_filter";

export function PeekDrawer({
  containerStyle,
  containerClassName,
}: {
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
}) {
  const {
    state,
    dispatch,
    withoutSelectedPinFacilities,
    setCenterWithPinID,
    idPinMap,
  } = useMapContext();

  const openDrawerMemoPx = useMemo(
    () => Math.max(state.uiDimensions, HEAD_PX), // 安全クランプ
    [state.uiDimensions]
  );

  const snapPoints = useMemo<[`${number}px`, `${number}px`]>(
    () => [`${HEAD_PX}px`, `${openDrawerMemoPx}px`],
    [openDrawerMemoPx]
  );

  // 初期は“ピーク”状態から
  const [snapPoint, setSnapPoint] = useState<string | number | null>(
    snapPoints[0]
  );
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const items: CardProps[] = useMemo<CardProps[]>(() => {
    if (withoutSelectedPinFacilities.mode === "distanceFromSelectedPin") {
      return withoutSelectedPinFacilities.data.map(
        (facilityId) =>
          ({
            facility: {
              id: facilityId.id,
              ...idPinMap.get(facilityId.id)!,
            },
            distance: {
              meter: facilityId.distanceMeter,
              from: "selectedPin",
            },
            handleClick: setCenterWithPinID,
          }) satisfies CardProps
      );
    } else if (withoutSelectedPinFacilities.mode === "distanceFromGeolocate") {
      return withoutSelectedPinFacilities.data.map(
        (facilityId) =>
          ({
            facility: {
              id: facilityId.id,
              ...idPinMap.get(facilityId.id)!,
            },
            distance: {
              meter: facilityId.distanceMeter,
              from: "geolocate",
            },
            handleClick: setCenterWithPinID,
          }) satisfies CardProps
      );
    }
    return withoutSelectedPinFacilities.data.map(
      (facilityId) =>
        ({
          facility: {
            id: facilityId.id,
            ...idPinMap.get(facilityId.id)!,
          },
          handleClick: setCenterWithPinID,
        }) satisfies CardProps
    );
  }, [
    withoutSelectedPinFacilities.mode,
    withoutSelectedPinFacilities.data,
    idPinMap,
    setCenterWithPinID,
  ]);

  const selectedFacility = useMemo(
    () => state.focusedPinId && idPinMap.get(state.focusedPinId),
    [state.focusedPinId, idPinMap]
  );

  const selectedItem: SelectedCardProps | null =
    useMemo<SelectedCardProps | null>(() => {
      if (!selectedFacility || !state.focusedPinId) return null;
      const facility: Facility = {
        ...selectedFacility,
        id: state.focusedPinId,
      };
      return {
        facility,
        handleCloseClick: () => {
          dispatch({ type: "SET_FOCUSED_PIN_ID", payload: null });
          console.log("closed", state.focusedPinId);
        },
        handleClick: setCenterWithPinID,
        distanceFromGeolocate: state.geolocatePos
          ? distanceMetersFloor(facility, state.geolocatePos)
          : undefined,
      } satisfies SelectedCardProps;
    }, [
      selectedFacility,
      state.focusedPinId,
      state.geolocatePos,
      setCenterWithPinID,
      dispatch,
    ]);

  const facilitiesDiv = useMemo(() => {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4" aria-hidden>
        {selectedItem && <SelectCard {...selectedItem} />}
        {items.map((it) => (
          <NormalCard key={it.facility.id} {...it} />
        ))}
      </div>
    );
  }, [items, selectedItem]);

  useEffect(() => {
    if (state.uiVisible) {
      setSnapPoint(snapPoints[1]);
    }
    if (!state.uiVisible) {
      setSnapPoint(snapPoints[0]);
    }
  }, [snapPoints, setSnapPoint, state.uiVisible]);

  return (
    <div>
      {/* container は常時描画して ref を確定 */}
      <div
        ref={setContainer}
        className={containerClassName}
        style={{ position: "relative", ...containerStyle }}
      />

      {container && (
        <Drawer.Root
          container={container}
          direction="bottom"
          modal={false}
          dismissible={false}
          noBodyStyles
          snapPoints={snapPoints}
          activeSnapPoint={snapPoint}
          setActiveSnapPoint={(v) => {
            if (v === snapPoints[0]) {
              dispatch({ type: "SET_UI_VISIBLE", payload: false });
            }
            if (v === snapPoints[1]) {
              dispatch({ type: "SET_UI_VISIBLE", payload: true });
            }
          }}
          snapToSequentialPoint
          defaultOpen
          fadeFromIndex={0}
          open={true}
          onOpenChange={() => {}}
        >
          <Drawer.Portal container={container}>
            {/* 背景を触れるので pointer-events はなし */}
            <Drawer.Overlay className="pointer-events-none bg-black/50" />

            <Drawer.Content
              // 位置は Vaul に任せる（absolute など付けない）
              className="
                group/drawer-content bg-background z-50 flex flex-col
                rounded-t-lg border-t text-foreground shadow-lg inset-x-0
              "
              style={{
                height: `${openDrawerMemoPx}px`,
                width: "100vw", // container 幅にフィット
                zIndex: 100,
              }}
            >
              <div
                style={{
                  height: `${HEAD_PX}px`,
                  maxHeight: `${HEAD_PX}px`,
                }}
              >
                {/* ハンドル（デザインは自由に変えてOK） */}
                <Drawer.Handle
                  style={{
                    width: "60px",
                    maxHeight: `${HEAD_PX}px`,
                    marginTop: "14px",
                    cursor: "grab",
                  }}
                  className="mx-auto mt-3 h-2 rounded-full bg-muted"
                />
                <CalmFilterToggleGroup />

                {/* 見出し（スクリーンリーダー用なら sr-only） */}
                <VisualHiddenRoot>
                  <Drawer.Title className="sr-only">Peek Drawer</Drawer.Title>
                </VisualHiddenRoot>
              </div>

              {/* スクロール領域（ヘッダ分を引いた高さ） */}
              <div
                style={{
                  height: `${openDrawerMemoPx - HEAD_PX}px`,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: "calc(env(safe-area-inset-bottom,0) + 16px)",
                }}
                className="px-5"
              >
                {facilitiesDiv}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </div>
  );
}
