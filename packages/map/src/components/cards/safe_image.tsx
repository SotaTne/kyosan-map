import React from "react";
import { SafeImageProps } from "../../types/map-type";

export function SafeImage({
  src,
  alt,
  size = 112,
  fallbackColor = "#f1f5f9",
}: SafeImageProps) {
  const [error, setError] = React.useState(false);
  const showFallback = error || !src;

  return (
    <div
      className="flex-none overflow-hidden rounded-lg border"
      style={{ width: size, height: size }}
    >
      {/* 中央にNo Imageを表示させたい */}
      {showFallback ? (
        <div
          role="img"
          aria-label={`${alt}（画像なし）`}
          className="h-full w-full grid place-items-center text-xs text-muted-foreground"
          style={{ background: fallbackColor, placeItems: "center" }}
        >
          No Image
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          height={size}
          width={size}
          className="block h-full w-full object-cover"
          onError={() => setError(true)}
          decoding="async"
          loading="lazy"
        />
      )}
    </div>
  );
}
