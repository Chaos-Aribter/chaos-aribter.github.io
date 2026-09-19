"use client";
import { useState } from 'react';

export function NewsImage({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`news-media ${className}`}>
    {src && !failed ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} /> : <div className="news-image-fallback" role="img" aria-label={`${alt}：图片待提供`}>图片待提供</div>}
  </div>;
}
