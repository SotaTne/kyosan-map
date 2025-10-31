import { useCallback, useState } from "react";
import { findNearestOCRBox } from "@kyosan-map/out-camera/functions/box_distance";
import { findBuilding } from "@kyosan-map/out-camera/functions/find_building";
import { useImageRecognizer } from "@kyosan-map/out-camera/hooks/recognizer-hook";
import type { OCRResult, Point } from "@kyosan-map/out-camera/types/type";

export type OCRDialogType =
  | "findText"
  | "noText"
  | "preparation"
  | "error"
  | "fail-camera"
  | "textOnly";

export type OCRResultData = {
  id: string;
  text: string;
  buildingName: string;
};

export function useOCR() {
  const recognizer = useImageRecognizer();
  const [isProcessing, setIsProcessing] = useState(false);

  const processOCR = useCallback(
    async (payload: { x: number; y: number; imageData: ImageData }) => {
      if (!recognizer) {
        return {
          type: "preparation" as const,
          result: null,
        };
      }

      setIsProcessing(true);

      try {
        const resultsRaw = await recognizer.run(payload.imageData);
        const results: OCRResult[] = resultsRaw[0]! as unknown as OCRResult[];

        if (!results || results.length === 0) {
          return {
            type: "noText" as const,
            result: null,
          };
        }

        const tap: Point = [payload.x, payload.y];
        const nearest = findNearestOCRBox(tap, results);

        if (!nearest) {
          return {
            type: "noText" as const,
            result: null,
          };
        }

        const text = nearest.text.trim();
        const building = findBuilding(text);

        if (building) {
          // 建物が見つかった場合
          return {
            type: "findText" as const,
            result: {
              id: building.id,
              text,
              buildingName: building.name,
            } as OCRResultData,
          };
        } else {
          // テキストのみ検出（建物未一致）
          return {
            type: "textOnly" as const,
            result: {
              id: "",
              text,
              buildingName: "",
            } as OCRResultData,
          };
        }
      } catch (err) {
        console.error("OCR processing error:", err);
        return {
          type: "error" as const,
          result: null,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [recognizer]
  );

  return {
    processOCR,
    isProcessing,
    isReady: !!recognizer,
  };
}
