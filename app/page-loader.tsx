"use client";

export function PageLoader({ progress, label = "正在连接新伊甸", leaving = false }: { progress: number; label?: string; leaving?: boolean }) {
  return <div className={`loader${leaving ? " loader-leaving" : ""}`} role="status" aria-live="polite" aria-label={label}>
    <p>{label} // {Math.round(progress * 100)}%</p>
    <span aria-hidden="true"><i className="loader-line" style={{ transform: `scaleX(${progress})` }} /></span>
  </div>;
}
