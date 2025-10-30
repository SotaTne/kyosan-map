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
      selectPinId: string;
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

export type SafeImageProps = {
  src?: string;
  alt: string;
  size?: number;
  fallbackColor?: string;
};

export type CardProps = {
  // title: string;
  // description: string;
  // category: PinCategory;
  // tags?: string[];
  // image?: string;
  facility: Facility;
  distance?: {
    meter: number;
    from: "geolocate" | "selectedPin";
  };
  handleClick: (id: string) => void;
};

export type SelectedCardProps = {
  facility: Facility;
  handleCloseClick: () => void;
  handleClick: (id: string) => void;
  distanceFromGeolocate?: number;
};
