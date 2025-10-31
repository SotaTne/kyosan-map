import rawBuildings from "@kyosan-map/shared/building.json" assert { type: "json" };
import type { Facility } from "../types/type";

/** 入力テキストを正規化 */
function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().trim();
}

/** なんでも一致を弾く */
function isTriviallyMatchAll(body: string): boolean {
  const b = body.trim();
  return (
    b === "" ||
    b === ".*" ||
    b === "^.*$" ||
    b === "^$" ||
    /^\(\?:\.\*\)$/.test(b)
  );
}

/** /re/flags 形式を解析 */
function parseSlashRegex(raw: string): { body: string; flags: string } | null {
  const m = /^\/(.+)\/([a-z]*)$/.exec(raw);
  if (!m) return null;
  return { body: m[1]!, flags: m[2] ?? "" };
}

/** パターン文字列を安全にコンパイル */
function compilePattern(raw: string): RegExp | null {
  const trimmed = raw?.trim?.() ?? "";
  if (!trimmed) return null;

  const slash = parseSlashRegex(trimmed);
  if (slash) {
    if (isTriviallyMatchAll(slash.body)) return null;
    let flags = slash.flags;
    if (!flags.includes("i")) flags += "i";
    if (!flags.includes("u")) flags += "u";
    try {
      return new RegExp(slash.body, flags);
    } catch {
      return null;
    }
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const visibleLen = [...trimmed].length;
  if (visibleLen < 2) return null;

  return new RegExp(`^(?:${escaped})$`, "iu");
}

type Compiled = { re: RegExp; building: Facility; source: string };

function getBuildings(): Facility[] {
  const src = (rawBuildings as any)?.data ?? rawBuildings;
  if (!Array.isArray(src)) return [];
  return src as Facility[];
}

/** 👇 COMPILED を関数経由で取得できるようにする */
let __compiledCache: Compiled[] | null = null;

export function getCompiled(): Compiled[] {
  if (__compiledCache) return __compiledCache;

  const out: Compiled[] = [];
  for (const b of getBuildings()) {
    if (!b.ocrName?.length) continue;
    for (const raw of b.ocrName) {
      const re = compilePattern(raw);
      if (re) out.push({ re, building: b, source: raw });
    }
  }
  __compiledCache = out;
  return out;
}

/** LRU風キャッシュ */
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

/** 建物検索関数 */
export function findBuilding(text: string): Facility | undefined {
  const key = normalize(text);
  if (!key) return undefined;

  const cached = cacheGet(key);
  if (cached !== undefined) return cached ?? undefined;

  for (const { re, building } of getCompiled()) {
    re.lastIndex = 0;
    if (re.test(key)) {
      cacheSet(key, building);
      return building;
    }
  }
  cacheSet(key, null);
  return undefined;
}

/** デバッグ用：マッチ元を確認 */
export function findBuildingWithDebug(text: string) {
  const key = normalize(text);
  for (const { re, building, source } of getCompiled()) {
    re.lastIndex = 0;
    if (re.test(key)) {
      return { building, matchedBy: source, regex: re };
    }
  }
  return undefined;
}

/** テスト用：キャッシュリセット */
export function __clearCacheForTest() {
  CACHE.clear();
  __compiledCache = null;
}
