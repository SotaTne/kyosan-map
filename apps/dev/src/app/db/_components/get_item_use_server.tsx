export function GetItemUseServer({
  item
}:{item: {
    id: string;
    name: string | null;
}[]}){
  //   const item = await getItems(); // でも動く
  return <div>{JSON.stringify(item)}</div>;
}