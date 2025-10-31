export const OCR_MODEL_PATHS = {
  det_model_path: "https://ocr-file-server.pages.dev/ppocrv5/det/det.ort",
  cls_model_path: "https://ocr-file-server.pages.dev/ppocrv5/cls/cls.ort",
  rec_model_path: "https://ocr-file-server.pages.dev/ppocrv5/rec/rec.ort",
  rec_char_dict_path:
    "https://ocr-file-server.pages.dev/ppocrv5/ppocrv5_dict.txt",
} as const;

export const ONNX_WASM_PATH = "https://ocr-file-server.pages.dev/ort/";
