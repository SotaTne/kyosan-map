"use client"

export function GetItemUseClient({
  item
}:{item: {
    id: string;
    name: string | null;
}[]}) {
  // const itemData = use(getItems());でも動く
  return <div>{JSON.stringify(item)}</div>;
}