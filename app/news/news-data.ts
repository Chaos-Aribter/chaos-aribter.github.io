import { readingTime, parseBody } from "./markdown";
import generatedNews from "./generated-news.json";

export type NewsTemplate = "battle" | "dispatch" | "bulletin" | "text";

export type NewsItem = {
  slug: string;
  template: NewsTemplate;
  category: string;
  date: string;
  body: string;
  source?: string;
  cover?: string;
  thumbnail?: string;
  homeSlide?: boolean;
  draft?: boolean;
  demo?: boolean;
  read: string;
  title: string;
  summary: string;
  accent: "ember" | "cyan" | "violet" | "gold";
  featured?: boolean;
};

export type NewsInput = Omit<NewsItem, 'read' | 'body'> & { body?: string };
const demoSeeds: NewsInput[] = [
  { demo: true, slug: "summer-battle-report", template: "battle", category: "FLEET COMMAND", date: "2026-08-30", title: "夏季会战收官：三周击毁价值突破 3.2T ISK", summary: "历时三周的夏季会战正式落幕。舰队完成多次关键集结与区域清扫，记录每一位飞行员的投入。", accent: "ember", featured: true },
  { demo: true, slug: "rookie-training-14", template: "dispatch", category: "PILOT ACADEMY", date: "2026-08-24", title: "新人训练营第 14 期开放报名", summary: "从舰船基础到实战 PVP 编队，老兵一对一带教，毕业即可随队出击。", accent: "cyan" },
  { demo: true, slug: "industry-t2-line", template: "bulletin", category: "INDUSTRY", date: "2026-08-18", title: "工业体系升级：T2 生产线全线投产", summary: "三座新增内部设施投入使用，成员下单次日即可提货。", accent: "gold" },
  { demo: true, slug: "lp-exchange", template: "bulletin", category: "LOGISTICS", date: "2026-08-10", title: "8 月 LP 双倍兑换周开启，补给优先兑换", summary: "所有任务 LP 兑换倍率翻倍，旗舰补给品与劳力装备优先上架。", accent: "violet" },
  { demo: true, slug: "lowsec-weekly", template: "battle", category: "COMBAT INTEL", date: "2026-08-02", title: "低安游击周报：单周 49 杀，含掠袭级一艘", summary: "游击小队在低安完成 49 次击杀，周内最高单次战果为掠袭级一艘。", accent: "ember" },
];

const seeds: NewsInput[] = generatedNews.length ? generatedNews as NewsInput[] : demoSeeds;

export const newsItems: NewsItem[] = seeds.map(item => ({ ...item, template: item.template as NewsTemplate, accent: item.accent as NewsItem['accent'], demo: item.demo ?? false, body: item.body ?? `${item.summary}\n\n## ${item.title}\n\n这是一篇供本地验收的示例稿。正式发布前，请为本篇文章填写独立的经过、结果与后续安排，并提供对应图片。\n\n> 本示例不作为真实战果或执行通知。\n\n请按新闻规范补齐至少六百字的正文。当前模板支持段落、小标题、引用、要点和图片图注。`, read: '' })).map(item => ({ ...item, read: readingTime(item.body) }));

export function publishedNews(now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return newsItems.filter(item => !item.draft && item.date <= today).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function validateNews(items: NewsItem[]) {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.slug) || !/^[a-z0-9-]+$/.test(item.slug)) throw new Error('新闻 slug 必须唯一且仅含小写字母、数字、连字符');
    ids.add(item.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date)) || new Date(item.date).toISOString().slice(0,10) !== item.date) throw new Error('无效发布日期');
    if (!item.title.trim() || Array.from(item.title).length > (/[\u4e00-\u9fff]/.test(item.title) ? 60 : 80) || !item.summary.trim() || Array.from(item.summary).length > 120) throw new Error('标题或摘要不符合规范');
    const blocks = parseBody(item.body);
    if (blocks.filter(b => b.type === 'image').length > 3) throw new Error('正文最多三张图片');
    if (!item.demo && !item.draft && (item.template !== 'text' && (!item.cover || !item.thumbnail) || Array.from(item.body).length < 600 || blocks.filter(b => b.type === 'paragraph').length < 3 || (item.template !== 'text' && !blocks.some(b => b.type === 'heading')))) throw new Error('正式新闻必须提供题图、封面、600字正文、三个段落和小标题');
  }
}
validateNews(newsItems);

export const templateInfo: Record<NewsTemplate, { index: string; name: string; note: string }> = {
  battle: { index: "01", name: "战报模板", note: "适合会战、战绩、PVP 复盘；大图、战果统计与引用。" },
  dispatch: { index: "02", name: "简报模板", note: "适合训练、活动、招募；时间线与快速信息。" },
  bulletin: { index: "03", name: "公告模板", note: "适合工业、制度、补给；规则清单与执行节点。" },
  text: { index: "04", name: "纯文字模板", note: "适合历史、制度说明与组织介绍；无需图片。" },
};

export function getNews(slug: string) {
  return publishedNews().find((item) => item.slug === slug);
}
