// @ts-ignore
import { useMap } from "react-map-gl/maplibre";

// モバイル向けのテーブルコンポーネント
export function MobileTable() {
  // これは、したから出るテーブル
  const map = useMap();
  map.current?.easeTo({
    // padding設定
    // これは一元管理する
  })
}