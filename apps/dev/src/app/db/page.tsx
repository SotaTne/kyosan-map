import { getItems } from "./actions/get_items";

export default async function Page() {
  const item = await getItems();
  return (
    <div>
      <h1>items</h1>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </div>
  );
}