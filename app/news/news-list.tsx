"use client";

import Link from "next/link";
import { NewsImage } from "./news-image";
import { useEffect, useRef, useState } from "react";
import type { NewsItem } from "./news-data";

export const NEWS_PAGE_SIZE = 4;

export function NewsList({ items }: { items: NewsItem[] }) {
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLElement>(null);
  const totalPages = Math.ceil(items.length / NEWS_PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const visibleItems = items.slice((currentPage - 1) * NEWS_PAGE_SIZE, currentPage * NEWS_PAGE_SIZE);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>(":scope > .news-card"));
    let frame = 0;
    const layout = () => {
      const columns = Number(getComputedStyle(list).getPropertyValue("--news-columns")) || 1;
      const gap = 24;
      const width = (list.clientWidth - gap * (columns - 1)) / columns;
      const bottoms = Array<number>(columns).fill(0);
      list.dataset.masonry = "true";
      for (const card of cards) {
        const column = bottoms.indexOf(Math.min(...bottoms));
        card.style.width = `${width}px`;
        card.style.left = `${column * (width + gap)}px`;
        card.style.top = `${bottoms[column]}px`;
        bottoms[column] += card.getBoundingClientRect().height + gap;
      }
      list.style.height = `${Math.max(0, ...bottoms) - (cards.length ? gap : 0)}px`;
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(layout); };
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    cards.forEach(card => observer.observe(card));
    // Card height changes from fonts, images or container resizing trigger reflow.
    layout();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      delete list.dataset.masonry;
      list.style.removeProperty("height");
      for (const card of cards) {
        for (const name of ["width", "left", "top"]) card.style.removeProperty(name);
      }
    };
  }, [items, currentPage]);

  function changePage(next: number) {
    setPage(Math.max(1, Math.min(totalPages, next)));
    listRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    listRef.current?.focus({ preventScroll: true });
  }

  return <>
    {items.length === 0 && <p className="news-page-status">暂无新闻，敬请期待。</p>}
    <div className="news-list-layout"><section ref={listRef} className="news-grid" aria-label="新闻列表" tabIndex={-1}>
      {visibleItems.map(item => <Link className="news-card" href={`/news/${item.slug}`} key={item.slug}>
        {item.template !== "text" && <NewsImage src={item.thumbnail} alt={item.title} className="news-visual" />}
        <div className="card-copy"><p className="news-meta"><time dateTime={item.date}>{item.date}</time></p><h2>{item.title}</h2><p>{item.summary}</p><span className="card-arrow">↗</span></div>
      </Link>)}
    </section></div>
    {totalPages > 1 && <>
      <div className="news-pagination" role="navigation" aria-label="新闻分页">
        <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>上一页</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`第 ${number} 页`} aria-current={currentPage === number ? "page" : undefined} onClick={() => changePage(number)}>{number}</button>)}
        <button type="button" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>下一页</button>
      </div>
      <p className="news-page-status" role="status">第 {currentPage} / {totalPages} 页 · 共 {items.length} 条新闻</p>
    </>}
  </>;
}
