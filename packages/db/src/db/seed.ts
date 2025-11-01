import { db } from "../index";
import { items } from "./schema";

async function seedDefaults() {
  // 存在チェック
  const existing = await db.query.items.findFirst();

  console.log("existing", existing);

  if (!existing) {
    await db.insert(items).values([
      // 画像コンテンツ (星座イラスト) - 6作品
      { id: "ohituziza", name: "おひつじ座" },
      { id: "oushiza", name: "おうし座" },
      { id: "kaniza", name: "かに座" },
      { id: "otomeza", name: "おとめ座" },
      { id: "sasoriza", name: "さそり座" },
      { id: "uosza", name: "うお座" },

      // 音楽コンテンツ - 2作品
      { id: "maturi", name: "祭" },
      { id: "seiza", name: "星座" },

      // 3Dモデルコンテンツ - 2作品
      { id: "hutagoza", name: "ふたご座" },
      { id: "yagiza", name: "やぎ座" },
    ]);

    console.log("✅ Seeded 10 items successfully");
  } else {
    console.log("ℹ️ Items already exist, skipping seed");
  }
}

seedDefaults();
