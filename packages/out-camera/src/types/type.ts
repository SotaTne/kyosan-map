import type cvReadyPromise from "@techstark/opencv-js";
import type { ONNXPaddleOCR } from "onnx-ocr-js";
import type * as ort from "onnxruntime-web";
import type { ReactNode } from "react";

export type CV2 = Awaited<typeof cvReadyPromise>;
export type ORT = typeof ort;
export type TextSystem = Awaited<ReturnType<ONNXPaddleOCR["init"]>>;
export type Point = [number, number];
export type Box = [Point, Point, Point, Point];
export type OCRResult = [Box, [string, number]];

export interface ClientImageProviderProps {
  children: ReactNode;
  /** モデルファイルのパス設定 */
  modelPaths?: {
    det_model_path: string;
    cls_model_path: string;
    rec_model_path: string;
    rec_char_dict_path: string;
  };
  onnx_wasm_path?: string;
  /** カスタムローディング表示 */
  loadingComponent?: ReactNode;
  /** カスタムエラー表示 */
  errorComponent?: (error: Error) => ReactNode;
}

export type FacilityType = "building" | "tips" | "shop" | "food";

export type Facility = {
  /** 施設ID (ユニーク) */
  id: string;

  /** 施設名 */
  name: string;

  /** OCR検出用施設名（正規表現として扱われる） */
  ocrName?: string[];

  /** 施設説明 */
  description?: string;

  /** 種類 */
  type: FacilityType;

  /** 施設タグ */
  tags?: string[];

  /** 施設画像URL */
  image?: string;

  /** 緯度 (WGS84) */
  lat: number;

  /** 経度 (WGS84) */
  lng: number;

  /** 付随するコンテンツのid */
  contentsId?: string;
};

export type OcrAlertDialogProps = {
  result?: {
    text: string;
    buildingName?: string;
    id: string;
  } | null;
  type:
    | "findText"
    | "noText"
    | "preparation"
    | "error"
    | "fail-camera"
    | "textOnly"; // 準備中,テキスト検出,テキスト未検出,エラー
  onClose: () => void;
  handleNavigation: (buildingId: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};
