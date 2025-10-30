"use client";

import { DeliverMap } from "@kyosan-map/map/components/map";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MapInner() {
  const searchParams = useSearchParams();
  const focusPinId = searchParams.get("id");
  return <DeliverMap defaultFocus={focusPinId} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapInner />
    </Suspense>
  );
}
