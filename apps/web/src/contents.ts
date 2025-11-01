// コンテンツのすべてのデータをここに置く

import { CONTENTS_BASE_PATH } from "./config";
import { AudioContents, Contents, ImageContents, ModelContents } from "./type";

// 画像コンテンツ (星座イラスト)
const OHITUZI: ImageContents = {
  id: "ohituziza",
  kind: "image",
  title: "おひつじ座",
  displayUrl: "/images/ohituzi.webp",
};

const OUSHI: ImageContents = {
  id: "oushiza",
  kind: "image",
  title: "おうし座",
  displayUrl: "/images/oushi.webp",
};

const KANI: ImageContents = {
  id: "kaniza",
  kind: "image",
  title: "かに座",
  displayUrl: "/images/kani.webp",
};

const OTOME: ImageContents = {
  id: "otomeza",
  kind: "image",
  title: "おとめ座",
  displayUrl: "/images/otome.webp",
};

const SASORI: ImageContents = {
  id: "sasoriza",
  kind: "image",
  title: "さそり座",
  displayUrl: "/images/sasori.webp",
};

const UO: ImageContents = {
  id: "uosza",
  kind: "image",
  title: "うお座",
  displayUrl: "/images/uo.webp",
};

// 音楽コンテンツ
const MATURI: AudioContents = {
  id: "maturi",
  kind: "audio",
  title: "祭",
  displayUrl: "/musics/maturi.mp3",
};

const SEIZA: AudioContents = {
  id: "seiza",
  kind: "audio",
  title: "星座",
  displayUrl: "/musics/seiza.mp3",
};

// 3Dモデルコンテンツ
const HUTAGO: ModelContents = {
  id: "hutagoza",
  kind: "model",
  title: "ふたご座",
  displayUrl: "/models/hutago.glb",
};

const YAGI: ModelContents = {
  id: "yagiza",
  kind: "model",
  title: "やぎ座",
  displayUrl: "/models/yagi.glb",
};

// すべてのコンテンツをエクスポート
export const ALL_CONTENTS: Contents[] = [
  // 画像 (6作品)
  OHITUZI,
  OUSHI,
  KANI,
  OTOME,
  SASORI,
  UO,
  // 音楽 (2作品)
  MATURI,
  SEIZA,
  // 3Dモデル (2作品)
  HUTAGO,
  YAGI,
];

// // カテゴリ別にフィルタリングするヘルパー関数
// // kindには "image" | "audio" | "model" のいずれかを指定
// // より方安全に
// export function getContentsByKind<T extends Contents["kind"]>(
//   kind: T
// ): T extends "image"
//   ? ImageContents[]
//   : T extends "audio"
//     ? AudioContents[]
//     : T extends "model"
//       ? ModelContents[]
//       : never {
//   return ALL_CONTENTS.filter((content) => content.kind === kind) as any;
// }

export const IMAGE_CONTENTS: ImageContents[] = [
  OHITUZI,
  OUSHI,
  KANI,
  OTOME,
  SASORI,
  UO,
];

export const AUDIO_CONTENTS: AudioContents[] = [MATURI, SEIZA];

export const MODEL_CONTENTS: ModelContents[] = [HUTAGO, YAGI];

// IDでコンテンツを取得するヘルパー関数
export const getContentById = (id: string): Contents | undefined => {
  return ALL_CONTENTS.find((content) => content.id === id);
};

export const isValidContentId = (id: string): boolean => {
  return ALL_CONTENTS.some((content) => content.id === id);
};

export const getContentsFullUrl = (path: string): string => {
  return CONTENTS_BASE_PATH + path;
};
