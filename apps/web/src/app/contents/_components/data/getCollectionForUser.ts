"use server";

import { db } from "@repo/db"; // ← プロジェクトのクライアントに合わせて変更
import { collectionItems, items } from "@repo/db/src/db/schema"; // ←パス調整
import { and, eq } from "drizzle-orm";
import { CONTENTS, Kind } from "./contentMap";

export type ViewItem = {
  id: string;
  title: string;
  kind: Kind;
  unlocked: boolean;
  thumbUrl: string;
  displayUrl: string; // 未解放は /dummy.png
};

export async function getCollectionForUser(userId: string): Promise<ViewItem[]> {
  const rows = await db
    .select({
      itemId: items.id,
      name: items.name,
      unlockedUserId: collectionItems.userId, // null なら未解放
    })
    .from(items)
    .leftJoin(
      collectionItems,
      and(eq(collectionItems.itemId, items.id), eq(collectionItems.userId, userId))
    );

  return rows
    .map((r) => {
      const meta = CONTENTS[r.itemId];
      if (!meta) return null;
      const unlocked = !!r.unlockedUserId;
      return {
        id: meta.id,
        title: r.name ?? meta.title,
        kind: meta.kind,
        unlocked,
        thumbUrl: meta.thumbUrl,
        displayUrl: unlocked ? meta.url : "/dummy.png",
      } as ViewItem;
    })
    .filter(Boolean) as ViewItem[];
}

