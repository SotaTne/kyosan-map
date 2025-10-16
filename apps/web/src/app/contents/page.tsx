"use client";

import { AnimatePresence } from "framer-motion";
import { Suspense, useState } from "react";

import { AudioPlayer } from "@/app/contents/_components/audio/AudioPlayer";
import { imageMapping, listImage, listModel, listMusic } from "@/app/contents/_components/data/lists";
import { SectionImage } from "@/app/contents/_components/sections/SectionImage";
import { SectionModel } from "@/app/contents/_components/sections/SectionModel";
import { SectionMusic } from "@/app/contents/_components/sections/SectionMusic";
import { ModelViewer } from "@/app/contents/_components/three/ModelViewer";
import { ImagePullup } from "@/app/contents/_components/ui/ImagePullup";
import { PopupContainer } from "@/app/contents/_components/ui/PopupContainer";

export default function Page() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // A: 画像マッピング
  const handleAItemClick = (src: string) => {
    const mapped = imageMapping[src] || src;
    setSelectedImg(mapped);
  };

  // B: 楽曲選択（再生は AudioPlayer に委譲）
  const handleBItemClick = (song: string, title: string) =>
    setCurrentTrack({ src: song, title });

  // C: 3Dモデル選択
  const handleCItemClick = (model: string) => setSelectedModel(model);

  return (
    <main className="min-h-screen bg-white p-4 pb-28">
      <h1 className="text-2xl font-bold text-center mb-6">コレクション</h1>

      {/* === Aリスト === */}
      <SectionImage title="イラスト" items={listImage} onClickItem={handleAItemClick} />

      <div className="my-6 h-px w-full bg-gray-300/70" />

      {/* === Bリスト === */}
      <SectionMusic title="ミュージック" items={listMusic} onClickItem={handleBItemClick} />

      <div className="my-6 h-px w-full bg-gray-300/70" />

      {/* === Cリスト === */}
      <SectionModel title="3Dモデル" items={listModel} onClickItem={handleCItemClick} />

      {/* === プルアップ: 画像 === */}
      <AnimatePresence>
        {selectedImg && (
          <ImagePullup src={selectedImg} onClose={() => setSelectedImg(null)} />
        )}
      </AnimatePresence>

      {/* === プルアップ: 3Dモデル === */}
      <AnimatePresence>
        {selectedModel && (
          <PopupContainer onClose={() => setSelectedModel(null)}>
            <div className="w-full h-80">
              <Suspense fallback={<p className="text-center mt-4">Loading 3D Model...</p>}>
                <ModelViewer modelPath={selectedModel} />
              </Suspense>
            </div>
          </PopupContainer>
        )}
      </AnimatePresence>

      {/* === 再生バー（現在のトラックがある時のみ表示） === */}
      <AudioPlayer track={currentTrack} />
    </main>
  );
}
