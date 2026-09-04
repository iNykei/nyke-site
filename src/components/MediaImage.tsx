"use client";

import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

type MediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  alt: string;
  fallback: ReactNode;
};

export function MediaImage({ alt, fallback, src, onError, ...props }: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return fallback;

  return (
    // Public profile media may be external, so runtime fallback is more useful than build-time optimization.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      src={src}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
