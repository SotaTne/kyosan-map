"use client";

import { Suspense, useMemo, useState } from "react";
import { FOOTER_HEIGHT } from "../../../config";
import {
  AUDIO_CONTENTS,
  getContentsFullUrl,
  IMAGE_CONTENTS,
  MODEL_CONTENTS,
} from "../../../contents";
import { UserViewFlag } from "../../../type";
import { AudioBar } from "./audio/AudioBar";
import { SectionAudio } from "./sections/SectionAudio";
import { SectionImage } from "./sections/SectionImage";
import { SectionModel } from "./sections/SectionModel";
import { ModelViewer } from "./three/ModelViewer";
import { ImagePullup } from "./ui/ImagePullup";
import { PopupContainer } from "./ui/PopupContainer";
import { ProgressBadge } from "./ui/ProgressBadge";

export function ContentsViewer({ flags }: { flags: UserViewFlag[] }) {
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [previewModel, setPreviewModel] = useState<string | null>(null);
  const [track, setTrack] = useState<{ url: string; title: string } | null>(
    null
  );

  const progress = useMemo(() => {
    const unlockedFlags = flags.filter((f) => f.unlocked);
    const imageUnlocked = unlockedFlags.filter((f) =>
      IMAGE_CONTENTS.some((c) => c.id === f.contentsId)
    ).length;
    const audioUnlocked = unlockedFlags.filter((f) =>
      AUDIO_CONTENTS.some((c) => c.id === f.contentsId)
    ).length;
    const modelUnlocked = unlockedFlags.filter((f) =>
      MODEL_CONTENTS.some((c) => c.id === f.contentsId)
    ).length;

    const cgTotal = IMAGE_CONTENTS.length + MODEL_CONTENTS.length;
    const cgUnlocked = imageUnlocked + modelUnlocked;
    const totalContents = cgTotal + AUDIO_CONTENTS.length;
    const totalUnlocked = cgUnlocked + audioUnlocked;

    return {
      total: { current: totalUnlocked, total: totalContents },
      cg: { current: cgUnlocked, total: cgTotal },
      image: { current: imageUnlocked, total: IMAGE_CONTENTS.length },
      audio: { current: audioUnlocked, total: AUDIO_CONTENTS.length },
    };
  }, [flags]);

  return (
    <div
      style={{
        height: `calc(100vh - ${FOOTER_HEIGHT}px)`,
        width: "100%",
        position: "relative",
      }}
    >
      {/* スクロール領域 */}
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-3 py-2">
            <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
              <ProgressBadge label="すべて" {...progress.total} />
              <ProgressBadge label="CG" {...progress.cg} />
              <ProgressBadge label="イラスト" {...progress.image} />
              <ProgressBadge label="音楽" {...progress.audio} />
            </div>
          </div>
        </div>

        <SectionImage
          imageAllItems={IMAGE_CONTENTS}
          userItemFlags={flags}
          onClick={(i) => setPreviewImg(i.displayUrl)}
        />

        <SectionAudio
          audioAllItems={AUDIO_CONTENTS}
          userItemFlags={flags}
          onClick={(i) => setTrack({ url: i.displayUrl, title: i.title })}
        />

        <SectionModel
          modelAllItems={MODEL_CONTENTS}
          userItemFlags={flags}
          onClick={(i) => setPreviewModel(i.displayUrl)}
        />
      </div>

      {/* スクロール領域の外側 - モーダル、AudioBar */}
      {previewImg && (
        <PopupContainer onClose={() => setPreviewImg(null)}>
          <ImagePullup src={getContentsFullUrl(previewImg)} />
        </PopupContainer>
      )}
      {previewModel && (
        <PopupContainer onClose={() => setPreviewModel(null)}>
          <div className="w-full h-80">
            <Suspense fallback={<p>Loading model...</p>}>
              <ModelViewer url={getContentsFullUrl(previewModel)} />
            </Suspense>
          </div>
        </PopupContainer>
      )}
      {track && (
        <AudioBar
          src={getContentsFullUrl(track.url)}
          title={track.title}
          onClose={() => setTrack(null)}
        />
      )}
    </div>
  );
}
