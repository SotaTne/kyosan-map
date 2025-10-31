import { getCollectionForUser } from "@/app/contents/data/getCollectionForUser";
import { NextResponse } from "next/server";

export async function GET() {
  // 実装では認証から取得
  const userId = "demo-user";
  const data = await getCollectionForUser(userId);
  return NextResponse.json(data);
}
