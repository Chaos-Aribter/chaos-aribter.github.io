import Link from "next/link";

export function NewsNav() {
  return <nav className="news-nav" aria-label="主导航"><Link className="brand" href="/"><strong>混沌仲裁者</strong><span>CHAOS ARBITER//</span></Link><div><Link href="/#doctrine">军团内容</Link><Link href="/#intel">军团数据</Link><Link className="is-active" href="/news">新闻资讯</Link><Link href="/#join">加入混沌</Link></div></nav>;
}

export function NewsFooter() {
  return <footer className="news-footer"><span><b>混沌仲裁者</b><i>CHAOS ARBITER //</i></span><span>© 2026 CACX // NEW EDEN SIGNAL NETWORK</span><span>粤ICP备2026130616号</span></footer>;
}
