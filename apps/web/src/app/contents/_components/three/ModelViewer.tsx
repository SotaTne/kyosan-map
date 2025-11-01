"use client";

import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const DEFAULT_CAMERA_POS: [number, number, number] = [
  -0.006454317790902103, 1, 0.05110675728735652,
];
const DEFAULT_CAMERA_TARGET: [number, number, number] = [
  0.08151197595754733, 1.7594573226837995, -0.6454303779629925,
];
const DEFAULT_FOV = 50;

// 水平より上しか見せたくない場合は true に
const LIMIT_TO_ABOVE_HORIZON = true;

export function ModelViewer({ url }: { url: string }) {
  const gltf = useGLTF(url);

  return (
    <Canvas>
      {/* makeDefault でこのカメラを R3F のデフォルトにする */}
      <PerspectiveCamera
        makeDefault
        position={DEFAULT_CAMERA_POS}
        fov={DEFAULT_FOV}
        // ※ lookAt 相当は OrbitControls の target と一致させるのが安定
      />

      {/* ライティング（必要に応じて追加可能） */}
      <ambientLight intensity={0.5} />
      {/* <directionalLight position={[2, 2, 2]} intensity={1.2} /> */}

      {/* モデル */}
      <primitive object={gltf.scene} />

      {/* 向き＝target を固定。必要なら水平より上だけの制限も適用 */}
      <OrbitControls
        // target を指定すると、初期向きが確実に固定されます
        target={DEFAULT_CAMERA_TARGET}
        {...(LIMIT_TO_ABOVE_HORIZON
          ? {
              // 水平（0）～真上（≈π/2）だけ許可
              minPolarAngle: Math.PI / 3 - 0.01,
            }
          : {})}
      />
    </Canvas>
  );
}
