// find-building.ts
import { data } from "@kyosan-map/shared/building.json" assert { type: "json" };
import type { Facility } from "../types/type";

/** 入力テキストを正規化（大文字小文字/全半角/結合文字差などを吸収） */
function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().trim();
}

/** “なんでも一致” を弾く */
function isTriviallyMatchAll(body: string): boolean {
  const b = body.trim();
  // 代表例: 空 / .* / ^.*$ / ^$ / (?:.*) など
  return (
    b === "" ||
    b === ".*" ||
    b === "^.*$" ||
    b === "^$" ||
    /^\(\?:\.\*\)$/.test(b)
  );
}

/** /re/flags 形式を解析（成功なら {body, flags} を返す） */
function parseSlashRegex(raw: string): { body: string; flags: string } | null {
  const m = /^\/(.+)\/([a-z]*)$/.exec(raw);
  if (!m) return null;
  return { body: m[1]!, flags: m[2] ?? "" };
}

/** 与えられたパターン文字列を安全に RegExp 化する */
function compilePattern(raw: string): RegExp | null {
  const trimmed = raw?.trim?.() ?? "";
  if (!trimmed) return null;

  const slash = parseSlashRegex(trimmed);
  if (slash) {
    if (isTriviallyMatchAll(slash.body)) return null; // なんでも一致は禁止
    let flags = slash.flags;
    if (!flags.includes("i")) flags += "i";
    if (!flags.includes("u")) flags += "u";
    try {
      return new RegExp(slash.body, flags);
    } catch {
      return null;
    }
  }

  // リテラルは “全体一致” に固定（部分一致させたい場合は /.../ で書く）
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 1〜2 文字など極端に短いものは誤マッチ源になりやすいので弾く（必要なら閾値調整）
  const visibleLen = [...trimmed].length; // サロゲート対策
  if (visibleLen < 2) return null;

  return new RegExp(`^(?:${escaped})$`, "iu");
}

/** マッチ元をデバッグできるよう型を拡張 */
type Compiled = { re: RegExp; building: Facility; source: string };

/** 1回だけコンパイルして配列に展開 */
const COMPILED: Compiled[] = (() => {
  const out: Compiled[] = [];
  for (const b of data as Facility[]) {
    if (!b.ocrName?.length) continue;
    for (const raw of b.ocrName) {
      const re = compilePattern(raw);
      if (re) out.push({ re, building: b, source: raw });
    }
  }
  return out;
})();

/** LRU 風の超簡易キャッシュ */
const CACHE = new Map<string, Facility | null>();
const CACHE_LIMIT = 500;
function cacheGet(k: string) {
  if (!CACHE.has(k)) return undefined;
  const v = CACHE.get(k)!;
  CACHE.delete(k);
  CACHE.set(k, v);
  return v;
}
function cacheSet(k: string, v: Facility | null) {
  CACHE.set(k, v);
  if (CACHE.size > CACHE_LIMIT) {
    const first = CACHE.keys().next().value;
    if (first !== undefined) CACHE.delete(first);
  }
}

/** 最初にマッチした建物を返す（なければ undefined） */
export function findBuilding(text: string): Facility | undefined {
  const key = normalize(text);
  if (!key) return undefined;

  const cached = cacheGet(key);
  if (cached !== undefined) return cached ?? undefined;

  for (const { re, building } of COMPILED) {
    re.lastIndex = 0;
    if (re.test(key)) {
      cacheSet(key, building);
      return building;
    }
  }
  cacheSet(key, null);
  return undefined;
}

/** どのパターンで当たったか知りたいとき（デバッグ用。必要なら export して使う） */
export function findBuildingWithDebug(text: string) {
  const key = normalize(text);
  for (const { re, building, source } of COMPILED) {
    re.lastIndex = 0;
    if (re.test(key)) {
      return { building, matchedBy: source, regex: re };
    }
  }
  return undefined;
}
