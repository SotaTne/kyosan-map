"use server";

import { auth } from "@/auth";
import { Facility } from "@/type";
import { db } from "@kyosan-map/db";
import { collectionItems } from "@kyosan-map/db/db/schema";
import rawBuildings from "@kyosan-map/shared/building.json" assert { type: "json" };
import { and, eq } from "drizzle-orm";

const data = rawBuildings.data as Facility[];

export async function handleScan(facilityId: string): Promise<string | void> {
  const contentsId = data.find((f) => f.id === facilityId)?.contentsId;
  if (!contentsId) return;

  const session = await auth();
  const user = session?.user;

  if (!user?.id) return;

  const userId = user.id;

  // 存在チェック：collectionItems から first を取得
  const existing = await db.query.collectionItems.findFirst({
    where: (ci) => and(eq(ci.userId, userId), eq(ci.itemId, contentsId)),
  });

  if (!existing) {
    await db.insert(collectionItems).values({
      id: crypto.randomUUID(),
      userId: userId,
      itemId: contentsId,
    });
    return contentsId;
  }
}
