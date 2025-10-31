import { beforeEach, describe, expect, it, vi } from "vitest";

// 🔹 JSON モジュールをモック
// import assertion の問題を回避するため、vi.hoisted を使用
const mockBuildingData = vi.hoisted(() => ({
  data: [
    {
      id: "Shinri",
      name: "真理館",
      ocrName: ["/^真理.{1}$/", "真理館", "/^SR\\d{3}$/"],
    },
    {
      id: "karintou",
      name: "情報学部棟",
      ocrName: ["-14号館", "かりんとう"],
    },
    {
      id: "Sagittarius",
      name: "サギタリウス館",
      ocrName: ["/^S\\d{3}$/"],
    },
    {
      id: "Tenchi",
      name: "天地館",
      ocrName: ["/^T\\d{3}$/", "天地館"],
    },
    {
      id: "14",
      name: "14号館",
      ocrName: ["/^14\\d{3}$/", "/^14B\\d{2}$/", "14号館"],
    },
  ],
}));

vi.mock("@kyosan-map/shared/building.json", () => ({
  default: mockBuildingData,
}));

// 被テストコードの import はモックの後！
import { findBuilding } from "./find_building";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findBuilding – 正規表現・リテラル両対応 + 厳密競合防止", () => {
  it("真理館・サギタリウス館・天地館・14号館を正しくマッチ", () => {
    // リテラルマッチ: "真理館" に完全一致
    expect(findBuilding("真理館")).toMatchObject({ id: "Shinri" });
    // 正規表現マッチ: /^真理.{1}$/ にマッチ（真理 + 1文字）
    expect(findBuilding("真理堂")).toMatchObject({ id: "Shinri" });

    // 正規表現マッチ
    expect(findBuilding("S103")).toMatchObject({ id: "Sagittarius" });
    expect(findBuilding("T103")).toMatchObject({ id: "Tenchi" });

    // リテラルマッチと正規表現マッチ
    expect(findBuilding("14号館")).toMatchObject({ id: "14" });
    expect(findBuilding("14B01")).toMatchObject({ id: "14" });
  });

  it("SR館は正規表現にマッチする形式のみ許可（スペース/ハイフン入りは拒否）", () => {
    // 正規表現 /^SR\\d{3}$/ にマッチ
    expect(findBuilding("SR103")).toMatchObject({ id: "Shinri" });

    // スペースやハイフンが入ると正規表現にマッチしない
    expect(findBuilding("SR 103")).toBeUndefined();
    expect(findBuilding("SR-103")).toBeUndefined();
    expect(findBuilding("SR　103")).toBeUndefined();
  });

  it("全館混在入力の扱い", () => {
    // "真理103" は /^真理.{1}$/ にマッチしない（4文字なので）
    // 正規表現が完全一致を要求するため、マッチしない
    expect(findBuilding("真理103")).toBeUndefined();

    // 14B01 は /^14B\\d{2}$/ にマッチ
    expect(findBuilding("14B01")).toMatchObject({ id: "14" });

    // T103 は /^T\\d{3}$/ にマッチ
    expect(findBuilding("T103")).toMatchObject({ id: "Tenchi" });
  });

  it("未知の文字列は undefined を返す", () => {
    expect(findBuilding("謎の館")).toBeUndefined();
    expect(findBuilding("ZZZ999")).toBeUndefined();
    expect(findBuilding("")).toBeUndefined();
    expect(findBuilding("   ")).toBeUndefined();
  });

  it("大文字小文字・全角半角を正規化してマッチ", () => {
    // normalize により小文字化・NFKC正規化される
    expect(findBuilding("s103")).toMatchObject({ id: "Sagittarius" });
    expect(findBuilding("S１０３")).toMatchObject({ id: "Sagittarius" }); // 全角数字
    expect(findBuilding("ｓ103")).toMatchObject({ id: "Sagittarius" }); // 全角英字
  });

  it("極端に短い文字列（1文字）は除外される", () => {
    // compilePattern で visibleLen < 2 の場合は null を返す
    // 1文字のリテラルはマッチしない
    expect(findBuilding("S")).toBeUndefined();
    expect(findBuilding("1")).toBeUndefined();
  });
  it("かりんとうを認識できる", () => {
    expect(findBuilding("かりんとう")).toMatchObject({ id: "karintou" });
  });
});
