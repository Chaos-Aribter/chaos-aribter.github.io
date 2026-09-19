import { notFound } from "next/navigation";
import Link from "next/link";
import { getNews, publishedNews } from "../news-data";
import { NewsFooter, NewsNav } from "../components";
import { NewsImage } from "../news-image";
import { parseBody } from "../markdown";

export function generateStaticParams() { return publishedNews().map(({ slug }) => ({ slug })); }

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getNews(slug);
  if (!article) notFound();
  const items = publishedNews();
  const index = items.findIndex(item => item.slug === slug);
  const newer = items[index - 1], older = items[index + 1];
  const related = items.filter(item => item.slug !== slug).slice(0, 3);
  return <main className="news-page article-page">
    <NewsNav />
    <article className="article-shell">
      <div className="article-breadcrumb" role="navigation" aria-label="面包屑"><Link href="/">首页</Link><span>/</span><Link href="/news">新闻资讯</Link><span>/</span><span title={article.title}>{article.title}</span></div>
      <header className="article-head">
        <p className="news-kicker">[ {article.category} ]</p>
        {article.demo && <p className="news-demo">示例稿 · 内容及图片待正式编辑</p>}
        <p className="article-meta"><time dateTime={article.date}>{article.date}</time><span />{article.source?.trim() || "FLEET COMMAND"}</p>
        <h1>{article.title}</h1><p className="article-lead">{article.summary}</p>
      </header>
      {article.template !== "text" && <NewsImage src={article.cover} alt={article.title} className="article-cover" />}
      <div className="article-body markdown-body">{parseBody(article.body).map((block, i) => {
        if (block.type === "heading") return <h2 key={i}>{block.text}</h2>;
        if (block.type === "quote") return <blockquote key={i}>{block.text}</blockquote>;
        if (block.type === "list") return <ul key={i}>{block.items.map((text,j) => <li key={j}>{text}</li>)}</ul>;
        if (block.type === "image") return <figure key={i}><NewsImage src={block.src} alt={block.alt} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
        return <p key={i}>{block.text}</p>;
      })}</div>
      <nav className="article-pager" aria-label="上下篇">
        {newer ? <Link href={`/news/${newer.slug}`}>上一篇：{newer.title}</Link> : <span>已是最新一篇</span>}
        {older ? <Link href={`/news/${older.slug}`}>下一篇：{older.title}</Link> : <span>已是最后一篇</span>}
      </nav>
      {related.length > 0 && <section className="related-news"><p className="news-kicker">[ 继续阅读 ]</p><div>{related.map(item => <Link href={`/news/${item.slug}`} key={item.slug}><small>{item.date}</small><b>{item.title}</b><span>↗</span></Link>)}</div></section>}
    </article><NewsFooter />
  </main>;
}
