"use server";

import { auth } from "@/auth";
import { db } from "@kyosan-map/db";
import { collectionItems } from "@kyosan-map/db/db/schema";
import { and, eq } from "drizzle-orm";

export async function handleScan(facilityId: string) {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) return;

  const userId = user.id;

  // 存在チェック：collectionItems から first を取得
  const existing = await db.query.collectionItems.findFirst({
    where: (ci) => and(eq(ci.userId, userId), eq(ci.itemId, facilityId)),
  });

  if (!existing) {
    await db.insert(collectionItems).values({
      id: crypto.randomUUID(),
      userId: userId,
      itemId: facilityId,
    });
  }
}
