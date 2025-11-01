"use client";

import { getContentById } from "@/contents";
import { DeliverMap } from "@kyosan-map/map/components/map";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { FOOTER_HEIGHT } from "../config";

function MapInner() {
  const searchParams = useSearchParams();
  const focusPinId = searchParams.get("id");
  const contentsId = searchParams.get("contentsId");
  if (contentsId) {
    const item = getContentById(contentsId);
    if (item) {
      toast.success(
        <Link href={`/contents`}>{item.title}を取得しました！</Link>
      );
    }
  }
  return (
    <DeliverMap defaultFocus={focusPinId} footerHeaderHeight={FOOTER_HEIGHT} />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapInner />
    </Suspense>
  );
}
