"use client";

import { ClientImageProvider } from "../_components/client-provider";
// @ts-ignore
import { OpenCvProvider } from "opencv-react";
import { ClientImageProviderProps } from "../types/type";

export function ImageActionProvider({
  children,
  modelPaths,
  onnx_wasm_path,
  loadingComponent,
  errorComponent,
}: ClientImageProviderProps) {
  return (
    <OpenCvProvider openCvPath="/opencv/opencv.js">
      <ClientImageProvider
        modelPaths={modelPaths}
        onnx_wasm_path={onnx_wasm_path}
        loadingComponent={loadingComponent}
        errorComponent={errorComponent}
      >
        {children}
      </ClientImageProvider>
    </OpenCvProvider>
  );
}
