export interface Facility {
  /** 施設ID (ユニーク) */
  id: string;

  /** 施設名 */
  name: string;

  /** OCR検出用施設名（これがないとOCR検出されない） */
  ocrName?: string;

  /** 施設説明 */
  description?: string;

  /** 種類 */
  type: "building" | "tips" | "shop" | "food";

  /** 施設タグ */
  tags?: string[];

  /** 施設画像URL */
  image?: string;

  /** 緯度 (WGS84) */
  lat: number;

  /** 経度 (WGS84) */
  lng: number;
}

export type PinCategory = "building" | "shop" | "food" | "tips";

export type MapPinProps = {
  category: PinCategory;
  title: string;
  active?: boolean;
  size?: number;
  activeScale?: number;
};

export type FacilityTableInfo =
  | {
      mode: "distanceFromGeolocate";
      data: {
        id: string;
        distanceMeter: number;
      }[];
    }
  | {
      mode: "distanceFromSelectedPin";
      data: {
        id: string;
        distanceMeter: number;
      }[];
    }
  | {
      mode: "default";
      data: {
        id: string;
      }[];
    };
