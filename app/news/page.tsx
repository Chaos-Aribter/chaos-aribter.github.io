import Link from "next/link";
import { NewsImage } from "./news-image";
import { publishedNews } from "./news-data";
import { NewsFooter, NewsNav } from "./components";
import { NewsList } from "./news-list";


export default function NewsIndexPage() {
  const items = publishedNews();
  const featured = items.find((item) => item.featured);
  const list = items.filter((item) => item.slug !== featured?.slug).sort((a, b) => b.date.localeCompare(a.date));

  return <main className="news-page">
    <NewsNav />
    <div className="news-shell">
      <header className="news-intro">
        <p className="news-kicker">[ 新闻资讯 ]</p>
        <h1>新闻中心</h1>
        <p>战报、公告、活动与工业动态。每一条信号，都是混沌仲裁者在新伊甸留下的坐标。</p>
      </header>

      {featured && <Link href={`/news/${featured.slug}`} className={`featured-news${featured.template === "text" ? " featured-news-text" : ""}`} aria-labelledby="featured-title">
        {featured.template !== "text" && <NewsImage src={featured.thumbnail} alt={featured.title} className="news-visual" />}
        <article className="featured-copy">
          <div className="news-meta"><b>置顶</b><span>{featured.date}</span></div>
          <h2 id="featured-title">{featured.title}</h2>
          <p>{featured.summary}</p>
          <span className="news-link">阅读全文 <b aria-hidden="true">↗</b></span>
        </article>
      </Link>}

      <NewsList items={list} />

    </div>
    <NewsFooter />
  </main>;
}
