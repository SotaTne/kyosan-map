export type Kind = "image" | "audio" | "model";

export type ContentMeta = {
  id: string;        // items.id と一致
  kind: Kind;
  title: string;
  thumbUrl: string;  // 一覧サムネ（公開）
  url: string;       // 本命（画像/音源/glb）
};

// 例：DBの item.id と合わせる
export const CONTENTS: Record<string, ContentMeta> = {
  "item-image-1": {
    id: "item-image-1",
    kind: "image",
    title: "コレクション1",
    thumbUrl: "/thumbs/image1.png",
    url: "/image-collection1.png",
  },
  "item-music-1": {
    id: "item-music-1",
    kind: "audio",
    title: "星座BGM",
    thumbUrl: "/thumbs/music1.png",
    url: "/audio/song1.mp3",
  },
  "item-model-1": {
    id: "item-model-1",
    kind: "model",
    title: "宇宙船",
    thumbUrl: "/thumbs/model1.png",
    url: "/models/model1.glb",
  },
};
