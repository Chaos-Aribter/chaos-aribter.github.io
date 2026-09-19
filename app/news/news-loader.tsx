"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "../page-loader";

// The shared news layout persists across list/detail navigation.
// Load once per entry into this section, without resetting for each pathname.
export function NewsLoader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let active = true;
    const cleanup: Array<() => void> = [];
    let exitTimer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (!active) return;
      active = false;
      setProgress(1);
      setDone(true);
      exitTimer = setTimeout(() => setHidden(true), 900);
    };
    // Only first-screen images block entry; lazy images further down load normally.
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.news-page img'))
      .filter(img => img.getBoundingClientRect().top < window.innerHeight);
    const tasks: Promise<unknown>[] = [document.fonts.ready, ...images.map(img => new Promise<void>(resolve => {
      if (img.complete) { resolve(); return; }
      const settle = () => resolve();
      img.addEventListener('load', settle, { once: true });
      img.addEventListener('error', settle, { once: true });
      cleanup.push(() => { img.removeEventListener('load', settle); img.removeEventListener('error', settle); });
    }))];
    let completed = 0;
    for (const task of tasks) task.finally(() => {
      completed++;
      if (active) setProgress(completed / tasks.length);
      if (completed === tasks.length) finish();
    });
    const deadline = setTimeout(finish, 8000);
    return () => { active = false; clearTimeout(deadline); clearTimeout(exitTimer); cleanup.forEach(fn => fn()); };
  }, []);
  return hidden ? null : <PageLoader progress={progress} leaving={done} />;
}
