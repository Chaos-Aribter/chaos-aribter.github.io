import Link from "next/link";
import { NewsImage } from "./news-image";
import { publishedNews } from "./news-data";

export function LatestNews() {
  const latest = publishedNews().slice(0, 3);
  return <section className="latest-news" aria-labelledby="latest-news-title">
    <header className="latest-news-heading">
      <div><p className="news-kicker">[ 新闻资讯 ]</p><h2 id="latest-news-title">最新动态，<em>第一时间知晓。</em></h2></div>
      <Link href="/news" className="news-all-link">查看全部新闻 <span aria-hidden="true">→</span></Link>
    </header>
    <div className="latest-news-grid">{latest.map(item => <Link className="news-card" key={item.slug} href={`/news/${item.slug}`}>
      {item.template !== "text" && <NewsImage src={item.thumbnail} alt={item.title} className="news-visual" />}
      <div className="card-copy"><time className="news-meta" dateTime={item.date}>{item.date}</time><h3>{item.title}</h3></div>
    </Link>)}</div>
  </section>;
}
