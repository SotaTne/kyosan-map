"use server";

import { db } from "@kyosan-map/db"; // ← プロジェクトのクライアントに合わせて変更
import { collectionItems, items } from "@kyosan-map/db/db/schema"; // ←パス調整
import { and, eq } from "drizzle-orm";
import { getContentById } from "../../contents/contents";
import { UserViewFlag } from "../../contents/type";

export async function getCollectionForUser(
  userId: string
): Promise<UserViewFlag[]> {
  const rows = await db
    .select({
      itemId: items.id,
      name: items.name,
      unlockedUserId: collectionItems.userId, // null なら未解放
    })
    .from(items)
    .leftJoin(
      collectionItems,
      and(
        eq(collectionItems.itemId, items.id),
        eq(collectionItems.userId, userId)
      )
    );

  return rows
    .map((r) => {
      const meta = getContentById(r.itemId);
      if (!meta) return null;
      const unlocked = !!r.unlockedUserId;
      return {
        contentsId: meta.id,
        unlocked,
      } satisfies UserViewFlag;
    })
    .filter((x) => x !== null);
}
