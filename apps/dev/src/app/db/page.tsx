import { getItems } from "../../lib/get_items";
import { GetItemUseClient } from "./_components/get_item_use_client";
import { GetItemUseServer } from "./_components/get_item_use_server";

export default async function Page() {
  const item = await getItems();
  return (
    <div>
      <GetItemUseClient item={item} />
      <GetItemUseServer item={item} />
    </div>
  );
}
