"use client";

import { DeliverMap } from "@kyosan-map/map/components/map";
import { useSearchParams } from "next/navigation";

export default function Page() {
  // ?id=xxxx のようなURLパラメータを受け取って、特定の施設にフォーカスする機能は後で実装する NextjsのClient ComponentでURLパラメータを読む方法がわからん
  // TODO: ここでfocusPinIdとして取得をする = nullにはしない
  const searchParams = useSearchParams();
  const focusPinId: string | null = searchParams.get("id");
  return <DeliverMap defaultFocus={focusPinId} />;
}
