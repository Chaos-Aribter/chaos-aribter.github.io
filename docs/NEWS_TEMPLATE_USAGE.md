# 通用新闻模板接入

所有详情共用 `app/news/[slug]/page.tsx`。不再按战报／公告硬编码正文；在 `app/news/news-data.ts` 的 seeds 中增加一条数据即可。

```ts
{
  slug: '2026-0006',
  template: 'battle', // 分类用途，不决定固定正文
  category: 'FLEET COMMAND',
  date: '2026-09-07',
  title: '文章标题',
  summary: '不超过120字的导语',
  source: '战报编辑部', // 留空使用 FLEET COMMAND
  accent: 'ember',
  featured: false,
  homeSlide: false,
  draft: true, // 正式发布改为 false
  demo: false,
  cover: '/images/news-2026-0006-cover.jpg',
  thumbnail: '/images/news-2026-0006-thumb.jpg',
  body: `第一段正文。

## 小标题

第二段正文。

- 要点

> 引用文字

![现场](/images/news-2026-0006-body-01.jpg)
*现场图注*

第三段正文，正式稿需补齐600字。`,
}
```

图片放入 `public/images`。正文采用规范限定的 Markdown 子集；不支持内容将显式报错。阅读时长自动计算。正式稿需满足必填校验；演示稿允许短文和缺图，但会在详情明确标注。

同一时刻存在多条 featured 时，展示按日期倒序的第一条；录入时应把旧置顶设为 false。当前没有编辑后台自动替换开关。

日期按上海日期比较；草稿和未来稿不参与列表或详情生成。静态部署需要在发布日重新构建，当前没有新增自动调度。

当前实现边界：homeSlide 字段已预留，首屏 Banner 新闻轮播尚未接入；图片尺寸与体积仍需按 NEWS_GUIDELINES.md 人工检查，没有自动裁图或上传后台。正式上线前必须更换演示数据与缺失素材。
