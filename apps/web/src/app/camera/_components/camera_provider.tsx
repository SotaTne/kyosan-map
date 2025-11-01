"use client";

import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";

import { ImageActionProvider } from "@kyosan-map/out-camera/components/image-action-provider";
import { OcrAlertDialog } from "@kyosan-map/out-camera/components/ocr-dialog";
import { WebGLCanvasCamera } from "@kyosan-map/out-camera/components/scalable-video";

import { OCR_MODEL_PATHS, ONNX_WASM_PATH } from "../_constants/model-paths";
import { useCamera } from "../_hooks/use-camera";
import { useOCR } from "../_hooks/use-ocr";
import { handleScan } from "../_server/handle-scan";
import type { OCRDialogType, OCRResultData } from "../_types/camera-types";

/**
 * ==========================================
 * 内部カメラコンポーネント
 * ==========================================
 */
function CameraInner({
  headerFooterHeight = 0,
}: {
  headerFooterHeight?: number;
}) {
  const router = useRouter();
  const { stream, error: cameraError, startCamera } = useCamera();
  const { processOCR } = useOCR();

  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<OCRResultData | null>(null);
  const [type, setType] = useState<OCRDialogType>("preparation");

  // ビューポートサイズ
  const vh_100 = window.innerHeight;
  const vw_100 = window.innerWidth;

  const viewHeightSize = vh_100 - headerFooterHeight;

  // カメラエラーを検知してダイアログを表示
  useEffect(() => {
    if (cameraError) {
      setType(cameraError);
      setOpen(true);
    }
  }, [cameraError]);

  // カメラを自動起動
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // タップ時のOCR処理
  const handleTap = useCallback(
    async (payload: { x: number; y: number; imageData: ImageData }) => {
      const ocrResult = await processOCR(payload);

      setType(ocrResult.type);
      setResult(ocrResult.result);
      setOpen(true);
    },
    [processOCR]
  );

  // ナビゲーション処理
  const submitAction = async (buildingId: string) => {
    startTransition(async () => {
      const data = await handleScan(buildingId);
      if (data) {
        router.push(`/?id=${buildingId}&contentsId=${data}`);
      } else {
        router.push(`/?id=${buildingId}`);
      }
    });
  };

  // WebGLの完全リセット処理（Android対策）
  const handleForceReset = useCallback(() => {
    console.log("[CameraProvider] Forcing complete WebGL reset");
    // ページ全体をリロードして完全にクリーンな状態にする
    window.location.reload();
  }, []);

  return (
    <>
      {stream ? (
        <WebGLCanvasCamera
          stream={stream}
          width={vw_100}
          height={viewHeightSize}
          onTap={handleTap}
          className="w-full h-auto"
          reloadPos="top-right"
          onForceReset={handleForceReset}
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
        handleNavigation={submitAction}
      />
    </>
  );
}

/**
 * ==========================================
 * 親コンポーネント（Providerを維持）
 * ==========================================
 */
export function CameraProvider({
  headerFooterHeight,
}: {
  headerFooterHeight?: number;
}) {
  return (
    <ImageActionProvider
      modelPaths={OCR_MODEL_PATHS}
      onnx_wasm_path={ONNX_WASM_PATH}
      // loadingComponent={
      //   <div className="flex items-center justify-center min-h-[60vh]">
      //     <div className="text-center">
      //       <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
      //       <div className="text-gray-700">
      //         OCR を初期化中です…（初回のみ時間がかかります）
      //       </div>
      //     </div>
      //   </div>
      // }
      errorComponent={(error) => (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md p-4 bg-white rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-rose-600 mb-2">
              初期化エラー
            </h2>
            <p className="text-gray-700 mb-3">{error.message}</p>
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
                onClick={() => {
                  // WebGLキャッシュを完全にクリアしてリロード
                  console.log(
                    "[ErrorComponent] Clearing WebGL cache and reloading"
                  );

                  // IndexedDBとlocalStorageをクリア
                  if (window.indexedDB && window.indexedDB.databases) {
                    window.indexedDB.databases().then((dbs) => {
                      dbs.forEach((db) => {
                        if (db.name) window.indexedDB.deleteDatabase(db.name);
                      });
                    });
                  }

                  // キャッシュストレージをクリア
                  if ("caches" in window) {
                    caches.keys().then((names) => {
                      names.forEach((name) => caches.delete(name));
                    });
                  }

                  // 少し待ってからリロード
                  setTimeout(() => {
                    window.location.reload();
                  }, 200);
                }}
              >
                完全リセット＆リロード
              </button>
              <button
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={() => window.location.reload()}
              >
                通常リロード
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※ Androidで黒い画面になる場合は「完全リセット」をお試しください
            </p>
          </div>
        </div>
      )}
    >
      <CameraInner headerFooterHeight={headerFooterHeight} />
    </ImageActionProvider>
  );
}
