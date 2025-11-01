export type FacilityType = "building" | "tips" | "shop" | "food";

export type Facility = {
  /** 施設ID (ユニーク) */
  id: string;

  /** 施設名 */
  name: string;

  /** OCR検出用施設名（正規表現として扱われる） */
  ocrName?: string[];

  /** 施設説明 */
  description?: string;

  /** 種類 */
  type: FacilityType;

  /** 施設タグ */
  tags?: string[];

  /** 施設画像URL */
  image?: string;

  /** 緯度 (WGS84) */
  lat: number;

  /** 経度 (WGS84) */
  lng: number;

  /** 付随するコンテンツのid */
  contentsId?: string;
};

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
