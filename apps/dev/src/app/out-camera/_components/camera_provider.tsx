"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ImageActionProvider } from "@kyosan-map/out-camera/components/image-action-provider";
import { OcrAlertDialog } from "@kyosan-map/out-camera/components/ocr-dialog";
import { WebGLCanvasCamera } from "@kyosan-map/out-camera/components/scalable-video";
import { findNearestOCRBox } from "@kyosan-map/out-camera/functions/box_distance";
import { findBuilding } from "@kyosan-map/out-camera/functions/find_building";
import { useImageRecognizer } from "@kyosan-map/out-camera/hooks/recognizer-hook";
import type { OCRResult, Point } from "@kyosan-map/out-camera/types/type";
import { useRouter } from "next/navigation";

/**
 * ==========================================
 * 内部カメラコンポーネント
 * ==========================================
 */
function CameraInner() {
  const recognizer = useImageRecognizer();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    text: string;
    buildingName: string;
  } | null>(null);
  const [type, setType] = useState<
    "findText" | "noText" | "preparation" | "error" | "fail-camera" | "textOnly"
  >("preparation");
  const vh_100 = window.innerHeight;
  const vw_100 = window.innerWidth;

  /** 🚀 カメラ開始 */
  const startCamera = useCallback(async () => {
    if (isStarting || isRunning) return;

    try {
      setIsStarting(true);
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 9999 },
          height: { ideal: 9999 },
        },
        audio: false,
      });

      streamRef.current = s;
      setStream(s);
      setIsRunning(true);
    } catch (err) {
      setType("fail-camera");
      setOpen(true);
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isRunning]);

  /** 🛑 カメラ停止 */
  // const stopCamera = useCallback(() => {
  //   const s = streamRef.current;
  //   if (s) {
  //     s.getTracks().forEach((t) => t.stop());
  //     streamRef.current = null;
  //   }
  //   setStream(null);
  //   setIsRunning(false);
  // }, []);

  /** 🚫 unmount時もストリームを維持（iOS Safari対策） */
  useEffect(() => {
    return () => {
      // 🔥 stream は停止しない
    };
  }, []);

  /** 👆 タップ時のOCR処理 */
  const handleTap = useCallback(
    async (payload: { x: number; y: number; imageData: ImageData }) => {
      if (!recognizer) {
        setType("preparation");
        setOpen(true);
        return;
      }

      try {
        const resultsRaw = await recognizer.run(payload.imageData);

        const results: OCRResult[] = resultsRaw[0]! as unknown as OCRResult[];

        if (!results || results.length === 0) {
          setType("noText");
          setOpen(true);
          return;
        }

        const tap: Point = [payload.x, payload.y];
        const nearest = findNearestOCRBox(tap, results);

        if (!nearest) {
          setType("noText");
          setOpen(true);
          return;
        }

        const text = nearest.text.trim();
        const building = findBuilding(text);

        if (building) {
          // ✅ 一致
          setResult({
            id: building.id,
            text, // ← OCRの生文字
            buildingName: building.name,
          });
          setType("findText");
        } else {
          // ❗ 不一致（テキストのみ）
          setResult({
            id: "", // 一致しないのでIDは空
            text, // OCRの生文字は必ず渡す
            buildingName: "", // 空
          });
          setType("textOnly"); // ← 新しい種別
        }
        console.log("OCR Result:", text, building);
        setOpen(true);
        return;
      } catch (err) {
        setType("error");
        setOpen(true);
      }
    },
    [recognizer]
  );

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // --------------------------------------
  // ✅ JSX
  // --------------------------------------
  return (
    <>
      {/* <button
        onClick={startCamera}
        disabled={isStarting || isRunning}
        className={`px-4 py-2 rounded ${
          isStarting || isRunning
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isStarting ? "起動中..." : "カメラ開始"}
      </button> */}
      {/* <button
        onClick={stopCamera}
        disabled={!isRunning}
        className={`px-4 py-2 rounded ${
          !isRunning
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-rose-600 text-white hover:bg-rose-700"
        }`}
      >
        カメラ停止
      </button> */}

      {/* <div className="mb-3 text-sm text-gray-600">
        <div>Recognizer: {recognizer ? "✅ ready" : "⏳ loading..."}</div>
        <div>Camera: {isRunning ? "📷 起動中" : "⏸ 停止中"}</div>
      </div> */}
      {stream ? (
        <WebGLCanvasCamera
          stream={stream}
          width={vw_100}
          height={vh_100}
          onTap={handleTap}
          className="w-full h-auto"
          reloadPos="top-right"
        />
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-400">
          カメラを起動中です
        </div>
      )}
      <OcrAlertDialog
        result={result}
        type={type}
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
        handleNavigation={(buildingId) => {
          alert(`建物ID: ${buildingId} の建物へナビゲーションします`);
          // nextjsのルーターなどで遷移処理を実装
          // ここに取得処理を書く
          router.push(`/map?id=${buildingId}`);
        }}
      />
    </>
  );
}

/**
 * ==========================================
 * 親コンポーネント（Providerを維持）
 * ==========================================
 */
export function CameraProvider() {
  const modelPaths = useMemo(
    () => ({
      det_model_path: "https://ocr-file-server.pages.dev/ppocrv5/det/det.ort",
      cls_model_path: "https://ocr-file-server.pages.dev/ppocrv5/cls/cls.ort",
      rec_model_path: "https://ocr-file-server.pages.dev/ppocrv5/rec/rec.ort",
      rec_char_dict_path:
        "https://ocr-file-server.pages.dev/ppocrv5/ppocrv5_dict.txt",
    }),
    []
  );
  const onnx_wasm_path = useMemo(
    () => "https://ocr-file-server.pages.dev/ort/",
    []
  );

  return (
    <ImageActionProvider
      modelPaths={modelPaths}
      onnx_wasm_path={onnx_wasm_path}
      loadingComponent={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
            <div className="text-gray-700">
              OCR を初期化中です…（初回のみ時間がかかります）
            </div>
          </div>
        </div>
      }
      errorComponent={(error) => (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md p-4 bg-white rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-rose-600 mb-2">
              初期化エラー
            </h2>
            <p className="text-gray-700 mb-3">{error.message}</p>
            <button
              className="px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
              onClick={() => window.location.reload()}
            >
              リロード
            </button>
          </div>
        </div>
      )}
    >
      {/* ✅ Provider 内に残す */}
      <CameraInner />
    </ImageActionProvider>
  );
}
