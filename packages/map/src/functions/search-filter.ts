// functions/filter-facilities.ts
import type { Facility } from "../types/map-type";

/** 全角/半角・かな/カナ・記号/空白などをゆるく正規化 */
function normalize(s: string): string {
  return (
    s
      .toLowerCase()
      // 全角 → 半角（英数・記号）
      .replace(/[！-～]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
      )
      // 長音・各種記号・句読点・スペース類削除
      .replace(
        /[\u30fc\u2010-\u2015\u2212\uFF0D\-–—―_.,/\\|()［\[\]{}<>〈〉「」『』【】：:;、。・\s]+/g,
        ""
      )
      // ひらがな化（カタカナ → ひらがな）
      .replace(/[\u30a1-\u30f6]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0x60)
      )
  );
}

/** 「情報理工学部」→ ["情報理工学部","情報理工","情報","理工学部","学部"] のような派生語を作る簡易関数 */
function generateAliases(s: string): string[] {
  const n = normalize(s);
  const out = new Set<string>([n]);

  // 数字（号館対応など）：「14号館」→ "14","14号","14号館"
  const m = n.match(/\d+/g);
  if (m) for (const num of m) out.add(num);

  // 末尾をだんだん短く（情報理工学部 → 情報理工 → 情報）
  if (n.length >= 4) {
    for (let cut = n.length - 1; cut >= 2; cut--) {
      out.add(n.slice(0, cut));
    }
  }
  return [...out];
}

/** 施設1件に対する正規化済み検索用インデックス */
function buildFacilityIndex(f: Facility) {
  const name = normalize(f.name);
  const desc = normalize(f.description ?? "");
  const tags = (f.tags ?? []).map(normalize);

  // 派生語
  const alias = new Set<string>([
    ...generateAliases(f.name),
    ...(f.tags ?? []).flatMap(generateAliases),
  ]);

  return { name, desc, tags, alias };
}

/**
 * AND 検索:
 * - クエリは空白で分割 → すべてのトークンが「名前/説明/タグ/派生語」のどこかに前方一致 or 部分一致でヒットするものだけ通す
 * - 「14 情報」→ 両方にヒットした施設のみ
 * - 「情報理工学部」がタグなら「情報理工」「情報」でもOK（派生語）
 */
export function filterFacilitiesAND(
  facilities: Facility[],
  query: string
): Facility[] {
  const tokens = query
    .split(/[\s　]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(normalize);

  if (tokens.length === 0) return [];

  // 施設ごとにインデックス（使い回して高速化）
  const cache = new Map<string, ReturnType<typeof buildFacilityIndex>>();

  const getIndex = (f: Facility) => {
    let idx = cache.get(f.id);
    if (!idx) {
      idx = buildFacilityIndex(f);
      cache.set(f.id, idx);
    }
    return idx;
  };

  return facilities.filter((f) => {
    const idx = getIndex(f);
    return tokens.every((tk) => {
      // 完全一致 or 前方一致（name/desc は部分一致、tags/alias は前方一致寄り）
      if (idx.name.includes(tk)) return true; // 名称に含まれる
      if (idx.desc.includes(tk)) return true; // 説明に含まれる
      if (idx.tags.some((t) => t.startsWith(tk))) return true; // タグの前方一致
      if ([...idx.alias].some((a) => a.startsWith(tk))) return true; // 派生語の前方一致
      return false;
    });
  });
}
