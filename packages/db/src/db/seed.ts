import { db } from "../index";
import { items } from "./schema";

async function seedDefaults() {
  // 存在チェック
  const existing = await db.query.items.findFirst()

  console.log("existing", existing)

  if (!existing) {
    await db.insert(items).values([
      { id: "1", name: "学祭本部" },
      { id: "2", name: "情報理工棟" },
      { id: "3", name: "模擬店エリアA" },
    ]);
  }
}

seedDefaults();