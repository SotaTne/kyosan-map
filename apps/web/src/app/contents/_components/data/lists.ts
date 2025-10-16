// ======== データ定義 ========

// A: アイコン画像
export const listImage: string[] = ["/image1.png", "/image2.png"];

// B: 音楽
export const listMusic: { icon: string; song: string; title: string }[] = [
  { icon: "/image3.png", song: "/song1.mp3", title: "星屑の旋律" },
  { icon: "/image4.png", song: "/song2.mp3", title: "夜空の旅路" },
];

// C: 3Dモデル
export const listModel: { icon: string; model: string; title: string }[] = [
  { icon: "/dummy.png", model: "/model1.glb", title: "宇宙船モデル" },
];

// Aリストのアイコン → 本命画像マッピング
export const imageMapping: Record<string, string> = {
  "/image1.png": "/image-collection1.png",
  "/image2.png": "/image-collection2.png",
};
