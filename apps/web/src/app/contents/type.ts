export interface UserViewFlag {
  contentsId: string;
  unlocked: boolean;
}

export interface Contents {
  id: string;
  kind: "image" | "audio" | "model";
  title: string;
  thumbUrl?: string; // サムネイル画像
  displayUrl: string; // 実際に表示する画像や音楽、3DモデルのURL
}

export interface ImageContents extends Contents {
  kind: "image";
}

export interface AudioContents extends Contents {
  kind: "audio";
}

export interface ModelContents extends Contents {
  kind: "model";
}
