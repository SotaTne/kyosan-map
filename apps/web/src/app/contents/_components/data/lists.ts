// ======== データ定義 ========

// A: アイコン画像
export const listImage: string[] = ["/images/image-ico1.png", "/images/image-ico2.png","/images/image-ico3.png", "/images/image-ico4.png"];

// B: 音楽
export const listMusic: { icon: string; song: string; title: string }[] = [
  { icon: "/images/image-ico1.png", song: "/musics/music1.mp3", title: "星屑の旋律" },
  { icon: "/images/image-ico2.png", song: "/musics/music2.mp3", title: "夜空の旅路" },
];

// C: 3Dモデル
export const listModel: { icon: string; model: string; title: string }[] = [
  { icon: "/images/image-ico3.png", model: "/models/model1.glb", title: "宇宙船モデル" },
];

// Aリストのアイコン → 本命画像マッピング
export const imageMapping: Record<string, string> = {
  "/images/image-ico1.png": "/images/image-data1.png",
  "/images/image-ico2.png": "/images/image-data2.png",
  "/images/image-ico3.png": "/images/image-data3.png",
  "/images/image-ico4.png": "/images/image-data4.png",
};
