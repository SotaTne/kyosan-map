"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function ModelViewer({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return (
    <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 2, 2]} intensity={1.2} />
      <primitive object={gltf.scene} />
      <OrbitControls enableZoom />
    </Canvas>
  );
}
