"use client";

import { DeliverMap } from "@kyosan-map/map/components/map";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FOOTER_HEIGHT } from "../../config";

function MapInner() {
  const searchParams = useSearchParams();
  const focusPinId = searchParams.get("id");
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
