# kyosan-map Architecture

この文書は、`kyosan-map` リポジトリの現在の実装を読んで整理した内部メモです。  
設計意図の推測よりも、現時点でコード上に存在する責務分割とデータフローを優先しています。

## 1. 全体像

`kyosan-map` は `pnpm` workspace + `turbo` で構成された monorepo です。  
役割としては、次の 3 つを一体で扱っています。

- 地図 UI と施設データの閲覧
- カメラ + OCR による施設認識
- 認識結果に応じたコンテンツ解放と閲覧

単体の「地図アプリ」ではなく、以下の体験をまとめたプロダクトです。

1. ユーザーが地図上で施設を見る
2. カメラで施設名を OCR する
3. OCR 結果から施設を特定する
4. 施設に紐づくコンテンツを DB 上で解放する
5. 解放済みコンテンツをコレクション画面で閲覧する

## 2. Monorepo 構成

ルート設定:

- package manager: `pnpm@10.17.1`
- task runner: `turbo`
- workspace: `apps/*`, `packages/*`
- Node 想定: `>=20`

ディレクトリ構成:

- `apps/web`
  - 実運用用の Next.js アプリ
- `apps/dev`
  - package 単位の検証用 Next.js アプリ
- `packages/map`
  - 地図表示 UI と施設選択ロジック
- `packages/out-camera`
  - OCR 用のカメラ UI / OpenCV / ONNX Runtime ラッパー
- `packages/db`
  - Turso/libsql + Drizzle + NextAuth 用スキーマ
- `packages/shared`
  - 施設マスタ JSON とその schema
- `packages/ui`
  - 共通 UI コンポーネント
- `packages/collections`
  - 現状ほぼ空。実装は未配置
- `packages/eslint-config`
  - ESLint 共通設定
- `packages/typescript-config`
  - TypeScript 共通設定

## 3. レイヤ構造

依存の向きは概ね次のとおりです。

```text
apps/web, apps/dev
  -> packages/map
  -> packages/out-camera
  -> packages/db
  -> packages/ui
  -> packages/shared

packages/map
  -> packages/shared
  -> packages/ui

packages/out-camera
  -> packages/shared
  -> packages/ui
  -> external OCR libraries

packages/db
  -> libsql / drizzle / next-auth

packages/shared
  -> 依存ほぼなし

packages/ui
  -> UI primitives のみ
```

土台になっているのは `packages/shared` と `packages/db` です。  
`packages/map` と `packages/out-camera` は独立した機能 package ですが、どちらも `shared/building.json` を参照します。

重要なのは、施設マスタが 1 つに集約されていて、

- map ではピン表示
- OCR では文字列マッチ対象
- camera server action では `contentsId` 解決

に共用されている点です。

## 4. アプリケーション境界

### `apps/web`

実際のプロダクト本体です。  
Next.js App Router を使い、以下の主要ルートを持ちます。

- `/`
  - 地図画面
  - `DeliverMap` を表示
  - `?id=` で施設フォーカス
  - `?contentsId=` があると取得通知 toast を表示
- `/camera`
  - カメラ起動、OCR 実行、施設判定、解放処理
- `/contents`
  - ログイン済みユーザーの解放済みコンテンツ一覧
- `/settings`
  - ログイン状態表示とログアウト導線
- `/api/auth/[...nextauth]`
  - NextAuth handler

補助構成:

- `src/auth.ts`
  - `NextAuth` 初期化
  - `DrizzleAdapter(db)` を使用
  - Google provider を使用
- `src/middleware.ts`
  - `auth` を middleware として export
- `src/components/providers.tsx`
  - theme provider と footer を全画面共通化

### `apps/dev`

package 単体の試験用アプリです。  
実装を見る限り、プロダクト用 UI ではなく、以下の動作確認に使われます。

- `/map`
  - `packages/map` 単体確認
- `/out-camera`
  - `packages/out-camera` 単体確認
- `/db`
  - DB 読み出し確認

本番導線はなく、開発時のプレイグラウンドに近い位置づけです。

## 5. コアデータ

### 5.1 施設マスタ: `packages/shared/building.json`

この repo の中心データです。  
各施設はおおむね次の情報を持ちます。

- `id`
- `name`
- `ocrName`
  - OCR で検出された文字列と照合するためのパターン
  - リテラルだけでなく regexp 文字列も使われる
- `type`
  - `building | tips | shop | food`
- `lat`, `lng`
- `description`
- `contentsId`
  - 解放対象コンテンツ ID

このデータは以下で再利用されています。

- `packages/map/src/config.ts`
  - 地図ピン元データ
- `packages/out-camera/src/functions/find_building.ts`
  - OCR 文字列と施設の対応付け
- `apps/web/src/app/camera/_server/handle-scan.ts`
  - 施設 ID から `contentsId` を引く

### 5.2 コンテンツ定義: `apps/web/src/contents.ts`

コンテンツ自体のメタデータは `shared` ではなく `apps/web` 内にあります。  
ここでは以下を定義しています。

- `ALL_CONTENTS`
- `IMAGE_CONTENTS`
- `AUDIO_CONTENTS`
- `MODEL_CONTENTS`
- `getContentById`
- `getContentsFullUrl`

つまり現状は:

- 施設マスタは `packages/shared`
- コンテンツマスタは `apps/web`

に分散しています。

### 5.3 DB スキーマ: `packages/db`

永続データは Turso/libsql を前提としています。  
主なテーブル:

- `user`
- `account`
- `session`
- `verificationToken`
- `authenticator`
  - NextAuth 関連
- `item`
  - 解放対象コンテンツ一覧
- `collection_item`
  - user と item の解放関係

`seed.ts` では `item` に 10 件の初期コンテンツ ID を投入します。  
この ID 群は `apps/web/src/contents.ts` のコンテンツ ID と揃える前提です。

## 6. 地図機能 (`packages/map`)

### 6.1 package の責務

`packages/map` は「MapLibre を使った施設閲覧 UI 一式」です。  
単なる地図描画ではなく、以下をまとめて持っています。

- 地図表示
- 施設ピン表示
- 施設検索
- 現在位置取得
- モバイル向け drawer UI
- フィルタリング
- 施設距離計算

### 6.2 入口コンポーネント

入口は `DeliverMap` (`packages/map/src/components/map.tsx`) です。

このコンポーネントが行うこと:

- `MapLibre` 地図の初期化
- 地図 style URL の指定
- viewport 変化の監視
- `MapNullableContextProvider` の生成
- `PeekDrawer`, `SearchBar`, `InnerMap` の組み立て
- `defaultFocus` がある場合の初期センタリング

### 6.3 外部依存

地図 style は package 内に存在せず、次を直接参照しています。

- `https://map-tile-server.pages.dev/style.json`

つまり地図タイル系はこの repo 内では完結せず、外部の Pages 配信資産に依存します。

### 6.4 状態管理

状態は `MapContext` + `useImmerReducer` です。  
保持しているのは主に以下です。

- UI の開閉状態
- UI の占有高さ
- フィルタ状態
- 選択中施設 ID
- viewport 情報
- geolocation 結果

`mapReducer` は小さく、複雑な導出値は reducer ではなく context 側で `useMemo` しています。

### 6.5 重要な導出ロジック

`map-context.tsx` では以下を導出しています。

- `sortedPinIds`
  - 現在の見かけ上の中心から近い順の施設 ID
- `_filteredPins`
  - viewport 内だけに絞った施設
- `adjustedCenter`
  - drawer が出た時の見かけ中心
- `pinsDistanceOfPoint`
  - 任意地点からの距離順施設配列
- `withoutSelectedPinFacilities`
  - 選択中施設を除いた表示用一覧
- `setCenterWithPinID`
  - 施設選択時の map easeTo と state 更新

### 6.6 UI オフセット補正

この package の特徴は、単純な「地図中心」ではなく、
drawer が画面下部を塞ぐ前提で中心補正を入れている点です。

`map-utils.ts` の `selectAdjustedCenter` は、

- 表示上の中心
- UI が占有する高さ
- map の project/unproject

を使って、施設が drawer の裏に隠れにくいようにセンタリングします。

### 6.7 検索

`search-filter.ts` はかなり独立した検索ロジックを持っています。

- 全角半角や記号をゆるく正規化
- カタカナ -> ひらがな
- 施設名や tag から派生語を生成
- 空白区切り token の AND 検索

検索対象は DB ではなく、地図上の施設マスタです。

## 7. OCR / カメラ機能 (`packages/out-camera`)

### 7.1 package の責務

`packages/out-camera` は、ブラウザ上で OCR を実行するための package です。  
担当範囲は次の通りです。

- カメラ映像を canvas/WebGL で扱う UI
- OpenCV.js のロード
- ONNX Runtime Web のロード
- OCR モデルの取得と初期化
- 画像前処理
- OCR 実行
- OCR 結果からの建物推定
- OCR 結果ダイアログ UI

### 7.2 provider 構成

使用時は `ImageActionProvider` を使います。

内部構成:

1. `OpenCvProvider` (`opencv-react`)
2. `ClientImageProvider`
3. `ImagePreprocessContext`
4. `ImageRecognizerContext`

`ClientImageProvider` は初回ロード時に:

- OpenCV を待つ
- `ImagePreprocessor` を生成
- `Recognizer.create(...)` を実行

という順で初期化します。

### 7.3 認識器 `Recognizer`

`Recognizer` はこの package のコアです。

役割:

- OCR リソースを fetch
- IndexedDB にキャッシュ
- `onnx-ocr-js` の `ONNXPaddleOCR` を初期化
- `onnxruntime-web` に wasm path を設定
- 入力画像を OCR 実行

特徴:

- リソース取得は `fetchResource` に集約
- IndexedDB store 名は `resources`
- キャッシュキーは URL 正規化結果
- OCR 入力は `canvas`, `image`, `Mat`, `ImageData` に対応

### 7.4 前処理

`ImagePreprocessor` は OpenCV ベースの画像前処理ラッパーです。

現状の処理:

- `RGBA -> BGR` 変換
- Gaussian blur
- CLAHE

ただし、`apps/web` 側の OCR フローでは現状 `Recognizer.run(imageData)` を使っており、
この前処理 class が常に実運用経路で使われているわけではありません。  
provider 初期化時には作られますが、ページ側で明示的に前処理を噛ませるコードは限定的です。

### 7.5 建物特定ロジック

OCR 後の建物特定は `find_building.ts` が担当します。

手順:

1. `shared/building.json` を読む
2. 各施設の `ocrName` をコンパイル
3. 入力文字列を NFKC + lowercase で正規化
4. 各 regexp / literal と照合
5. 最初に当たった施設を返す

このロジックは OCR 結果そのものではなく、「OCR 文字列 -> 施設 ID」変換の責務です。

### 7.6 タップベースの OCR 選択

OCR の結果が複数ボックスになることを前提に、
`box_distance.ts` でタップ位置に最も近い OCR ボックスを選びます。

つまりユーザー体験は:

- 画面内の任意位置をタップ
- OCR 全結果を出す
- タップ位置から最寄りのテキストボックスを選ぶ
- その文字列で施設を判定

という構造です。

### 7.7 外部 OCR アセット

`apps/web` から与えているモデル URL は次です。

- `https://ocr-file-server.pages.dev/ppocrv5/det/det.ort`
- `https://ocr-file-server.pages.dev/ppocrv5/cls/cls.ort`
- `https://ocr-file-server.pages.dev/ppocrv5/rec/rec.ort`
- `https://ocr-file-server.pages.dev/ppocrv5/ppocrv5_dict.txt`
- wasm base: `https://ocr-file-server.pages.dev/ort/`

したがって OCR 実行はこの repo 単独では完結せず、
Cloudflare Pages 上の `ocr-file-server` 配信物に依存します。

## 8. 認証・DB (`packages/db` + `apps/web/src/auth.ts`)

### 8.1 DB アクセス

`packages/db/src/index.ts` では `@libsql/client/web` を使って Turso client を生成し、
`drizzle` インスタンスを export しています。

前提環境変数:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

この依存は `turbo.json` にも env として明示されています。

### 8.2 認証

認証は NextAuth v5 beta + Google provider です。

構成:

- adapter: `DrizzleAdapter(db)`
- session/account/user: DB 永続化
- route handler: `app/api/auth/[...nextauth]/route.ts`

### 8.3 middleware

`apps/web/src/middleware.ts` は `auth as middleware` を export しています。  
そのため `apps/web` は NextAuth middleware の影響下にあります。

ただし、ページ実装を見ると未ログイン時でも `/contents` 自体は描画され、
モーダルでログインを促す構成になっています。  
実際のアクセス制御の最終挙動は NextAuth middleware 設定と route 条件に依存するため、
「全ページで強制リダイレクト」とまではこの文書では断定しません。

## 9. コンテンツ解放フロー

このプロダクトで一番重要な横断フローです。

### 9.1 スキャン時

`/camera` では次の順で処理されます。

1. `useCamera` で端末カメラ起動
2. `WebGLCanvasCamera` で映像表示
3. ユーザーが画面をタップ
4. `useOCR` が `recognizer.run(imageData)` を実行
5. OCR 結果のうちタップ位置に最も近いテキストを選択
6. `findBuilding(text)` で施設を特定
7. ダイアログで確認
8. `handleScan(buildingId)` を server action として呼ぶ

### 9.2 `handleScan`

`handleScan` は次を行います。

1. `shared/building.json` から `facilityId -> contentsId` を解決
2. `auth()` でログインユーザー取得
3. `collection_item` を照会
4. 未解放なら 1 レコード insert
5. 新規解放なら `contentsId` を返す

### 9.3 スキャン後の遷移

`CameraProvider` は `handleScan` の結果で遷移を分けます。

- 新規解放あり:
  - `/?id=<buildingId>&contentsId=<contentsId>`
- 既に解放済み or 非ログイン:
  - `/?id=<buildingId>`

地図トップページでは `contentsId` クエリがあれば toast を出し、
「取得しました」と `/contents` へのリンクを表示します。

### 9.4 コレクション画面

`/contents` では:

1. `auth()` でユーザー取得
2. `getCollectionForUser(user.id)` 実行
3. `items` と `collection_item` を left join
4. `contents.ts` のメタデータに紐づけ
5. `UserViewFlag[]` として UI に渡す

`ContentsViewer` はこの flag をもとに、

- イラスト
- 音声
- 3D モデル

を表示・ロック制御します。

## 10. 外部サービスとの境界

この repo は単体完結型ではなく、いくつかの Pages 配信資産を直接参照します。

### 10.1 map tile

- `packages/map/src/components/map.tsx`
- 参照先: `https://map-tile-server.pages.dev/style.json`

### 10.2 contents assets

- `apps/web/src/config.ts`
- `CONTENTS_BASE_PATH = https://kyosanmap-contents-server.pages.dev`

画像・音声・3D モデルはここから取得されます。

### 10.3 OCR assets

- `apps/web/src/app/camera/_constants/model-paths.ts`
- 参照先: `https://ocr-file-server.pages.dev/...`

つまり `kyosan-map` はアプリ本体であり、
配信アセット系は別 repo / 別 Pages プロジェクトに分離されています。

## 11. 現時点での package ごとの実態

### `packages/shared`

実質的に最重要 package の一つです。  
ただしコードではなく JSON 資産の保管場所です。

### `packages/ui`

shadcn/radix 系の共通 UI package です。  
アプリ固有ロジックはほぼありません。

### `packages/map`

かなりアプリ固有です。  
汎用 map package というより、施設閲覧体験そのものを持っています。

### `packages/out-camera`

こちらもかなりアプリ固有です。  
OCR 汎用 package というより、建物検出のユースケースに寄っています。

### `packages/db`

認証とコンテンツ解放を支える基盤 package です。

### `packages/collections`

現状は `package.json` と `tsconfig.json` しかなく、実装はありません。  
名前は存在するものの、現在のアーキテクチャでは未使用 placeholder と見てよいです。

## 12. 実装上の特徴と注意点

### 12.1 単一ソースではない

データ定義は 1 箇所にまとまりきっていません。

- 施設: `packages/shared/building.json`
- コンテンツメタ: `apps/web/src/contents.ts`
- 解放対象一覧: DB `items`

この 3 つは ID 整合に依存しています。

### 12.2 ID 同期が重要

以下は暗黙に揃っている必要があります。

- `building.json.contentsId`
- `contents.ts` の `Contents.id`
- `db seed` の `items.id`

どこかがずれると、

- スキャンで解放できない
- コレクションに表示されない
- toast は出ても表示先がない

といった不整合が起きます。

### 12.3 外部 URL が hardcode されている

次はコードに直書きされています。

- map tile server URL
- contents server URL
- OCR file server URL

環境切り替えや staging を考えると、現状は設定の集中管理が弱いです。

### 12.4 `apps/dev` と `apps/web` に重複がある

camera 周辺や map 表示など、`apps/dev` と `apps/web` に似たコードがあります。  
`apps/dev` は playground として妥当ですが、保守上は差分管理に注意が必要です。

### 12.5 OCR 前処理の実運用経路は薄い

`ImagePreprocessor` はしっかり実装されていますが、
`apps/web` の通常 OCR 経路では必ずしも前面に出ていません。  
将来的に OCR 精度改善をする場合、この層をどう噛ませるかが論点になります。

## 13. 実運用フローまとめ

### 地図表示

1. `apps/web` が `DeliverMap` を描画
2. `packages/map` が `shared/building.json` を読みピン化
3. `map-tile-server.pages.dev` の style/tile を表示

### OCR スキャン

1. `/camera` で `packages/out-camera` を初期化
2. `ocr-file-server.pages.dev` から OCR 資産を取得
3. OCR 文字列を `building.json` と照合
4. 施設 ID を返す

### コンテンツ解放

1. 施設 ID から `contentsId` 解決
2. ログインユーザーに対して `collection_item` を追加
3. 地図画面へ戻り、取得 toast を表示

### コンテンツ閲覧

1. `/contents` で `items + collection_item` を読む
2. `contents.ts` のメタデータと突き合わせる
3. `kyosanmap-contents-server.pages.dev` から実アセットを読む

## 14. この repo を短く言うと

`kyosan-map` は、

- 施設マスタ
- 地図 UI
- OCR による施設認識
- Google ログイン
- コンテンツ解放 DB
- コレクション閲覧 UI

を 1 つの monorepo にまとめたアプリ本体です。  
一方で、地図タイル・OCR モデル・画像音声3Dアセットそのものは別の Cloudflare Pages repo に切り出されています。
