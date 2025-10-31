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

export type CameraError = "fail-camera" | null;
