"use client";

import { Suspense, useState } from "react";
// import useSWR from "swr";
import { googleLoginAction } from "../login/actions";
import { LoginDialog } from "../login/login-dialog";
import { AudioBar } from "./_components/audio/AudioBar";
import { SectionImage } from "./_components/sections/SectionImage";
import { SectionModel } from "./_components/sections/SectionModel";
import { SectionMusic } from "./_components/sections/SectionMusic";
import { ModelViewer } from "./_components/three/ModelViewer";
import { ImagePullup } from "./_components/ui/ImagePullup";
import { PopupContainer } from "./_components/ui/PopupContainer";

export default function Page() {
  //const { data } = useSWR<ViewItem[]>("/api/collection", fetcher);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [previewModel, setPreviewModel] = useState<string | null>(null);
  const [track, setTrack] = useState<{ url: string; title: string } | null>(
    null
  );

  // if (!data) return <div className="p-4">Loading...</div>;
  // const images = data.filter((x) => x.kind === "image");
  // const musics = data.filter((x) => x.kind === "audio");
  // const models = data.filter((x) => x.kind === "model");

  return (
    <main className="p-4 pb-28">
      <h1 className="text-2xl font-bold text-center mb-6">コレクション</h1>

      <SectionImage
        title="画像"
        items={[]}
        onClick={(i) => setPreviewImg(i.displayUrl)}
      />
      <Divider />
      <button
        onClick={() => {
          alert("aaa");
        }}
      >
        aaa
      </button>

      <SectionMusic
        title="音楽"
        items={[]}
        onClick={(i) => setTrack({ url: i.displayUrl, title: i.title })}
      />
      <Divider />
      <button
        onClick={() => {
          alert("aaa");
        }}
      >
        aaa
      </button>

      <SectionModel
        title="3Dモデル"
        items={[]}
        onClick={(i) => setPreviewModel(i.displayUrl)}
      />

      {/* 画像プルアップ（高さ0対策済み） */}
      {previewImg && (
        <PopupContainer onClose={() => setPreviewImg(null)}>
          <ImagePullup src={previewImg} />
        </PopupContainer>
      )}

      <button
        onClick={() => {
          alert("aaa");
        }}
      >
        aaa
      </button>

      {/* 3Dモデル プルアップ */}
      {previewModel && (
        <PopupContainer onClose={() => setPreviewModel(null)}>
          <div className="w-full h-80">
            <Suspense fallback={<p>Loading model...</p>}>
              <ModelViewer url={previewModel} />
            </Suspense>
          </div>
        </PopupContainer>
      )}
      <button
        onClick={() => {
          alert("aaa");
        }}
      >
        aaa
      </button>

      {/* 再生バー */}
      {track && <AudioBar src={track.url} title={track.title} />}
      <LoginDialog open={true} googleLoginAction={googleLoginAction} />
    </main>
  );
}

function Divider() {
  return <div className="my-6 h-px bg-gray-300/70" />;
}
