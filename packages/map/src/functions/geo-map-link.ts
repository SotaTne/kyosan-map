"use client";

import isMobile from "ismobilejs";

export function getMapLink(lat: number, lng: number, label?: string): string {
  const coords = `${lat},${lng}`;
  const name = encodeURIComponent(label ?? "目的地");
  const device = isMobile(window.navigator);

  if (device.apple.device) {
    // 🍎 Apple系: iPhone / iPad
    return `maps://?q=${coords}`;
  }

  if (device.android.device || device.amazon.device) {
    // 🤖 Android系: Google Mapsアプリ
    return `geo:${coords}?q=${coords}(${name})`;
  }

  // 💻 その他: Web版Google Maps
  return `https://www.google.com/maps?q=${coords}`;
}
