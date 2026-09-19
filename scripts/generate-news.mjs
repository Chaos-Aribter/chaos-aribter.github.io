import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputArg = process.argv.find(arg => !arg.startsWith('--') && arg !== process.argv[0] && arg !== process.argv[1]) || 'content/news';
const resolvedArg = path.resolve(root, inputArg);
const inputStat = await fs.stat(resolvedArg).catch(() => null);
const input = inputStat?.isFile() ? path.dirname(resolvedArg) : resolvedArg;
const singleFile = inputStat?.isFile() ? path.basename(path.dirname(resolvedArg)) : null;
const checkOnly = process.argv.includes('--check');
// Reuse the site's Markdown contract without a second parser.
const parserSource = await fs.readFile(path.join(root, 'app/news/markdown.ts'), 'utf8');
const compiled = ts.transpileModule(parserSource, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const { parseBody, validateImageUrl } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const fields = ['模板','标题','副标题','发布日期','来源','是否置顶','是否首页滚动','题图URL','封面图URL'];
const articles = [];
const count = text => Array.from(text).length;
const fail = message => { throw new Error(message); };

async function imageUrl(value, minWidth, minHeight, maxKB, ratio) {
  validateImageUrl(value);
  const response = await fetch(value, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) fail(`图片请求失败：HTTP ${response.status}，${value}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxKB * 1024) fail(`图片超过 ${maxKB} KB：${value}`);
    chunks.push(chunk);
  }
  const meta = await sharp(Buffer.concat(chunks)).metadata();
  if (!['jpeg','png','webp'].includes(meta.format) || (meta.pages ?? 1) > 1) fail(`图片必须为静态 PNG/JPG/WebP：${value}`);
  if (!meta.width || !meta.height || meta.width < minWidth || meta.height < minHeight) fail(`图片至少 ${minWidth}×${minHeight}，实际 ${meta.width}×${meta.height}：${value}`);
  if (ratio && Math.abs(meta.width/meta.height/ratio - 1) > .02) fail(`图片比例不符合规范（允许 2% 误差），请人工裁图：${value}`);
  return value;
}

try {
  const directArticle = await fs.access(path.join(input, 'article.md')).then(() => true).catch(() => false);
  const dirs = directArticle ? [{ name: '.', isDirectory: () => true }] : (await fs.readdir(input, { withFileTypes: true })).filter(d => d.isDirectory() && (!singleFile || d.name === singleFile)).sort((a,b) => a.name.localeCompare(b.name));
  for (const entry of dirs) {
    const id = directArticle ? path.basename(input) : entry.name;
    try {
      if (!/^\d{4}-\d{4}$/.test(id)) fail('目录名必须为 YYYY-NNNN，例如 2026-0001');
      const dir = directArticle ? input : path.join(input, id);
      const source = (await fs.readFile(path.join(dir, 'article.md'), 'utf8')).replace(/^\uFEFF/, '').replace(/\r/g, '');
      const parts = source.split(/^【正文】\s*$/m);
      if (parts.length !== 2) fail('需要且只能有一个【正文】分隔行');
      const values = {};
      for (const line of parts[0].split('\n').filter(l => l.trim())) {
        const match = line.match(/^([^：:]+)[：:]\s*(.*)$/);
        if (!match || !fields.includes(match[1].trim())) fail(`未知字段：${line}`);
        const key = match[1].trim();
        if (key in values) fail(`重复字段：${key}`);
        values[key] = match[2].trim();
      }
      for (const key of fields.filter(k => !['来源','题图URL','封面图URL'].includes(k))) if (!values[key]) fail(`缺少字段：${key}`);
      const template = values['模板'];
      if (!['battle','dispatch','bulletin','text'].includes(template)) fail('模板只能填 battle、dispatch、bulletin 或 text');
      const textOnly = template === 'text';
      if (!textOnly && (!values['题图URL'] || !values['封面图URL'])) fail('图文模板必须提供题图URL和封面图URL');
      const title = values['标题'], summary = values['副标题'], date = values['发布日期'];
      if (count(title) > (/[\u4e00-\u9fff]/.test(title) ? 60 : 80) || count(summary) > 120) fail('标题或摘要超出字数限制');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) fail('发布日期无效');
      for (const key of ['是否置顶','是否首页滚动']) if (!['是','否'].includes(values[key])) fail(`${key}只能填是或否`);
      const body = parts[1].trim();
      const blocks = parseBody(body);
      const images = blocks.filter(b => b.type === 'image');
      const bodyIndex = images.length;
      if (bodyIndex > 3) fail('正文最多三张图片');
      for (const image of images) await imageUrl(image.src, 1292, 500, 500);
      const prose = blocks.flatMap(b => b.type === 'image' ? [] : b.type === 'list' ? b.items : [b.text]).join('').replace(/\s/g,'');
      if (count(prose) < 600 || blocks.filter(b => b.type === 'paragraph').length < 3 || (!textOnly && !blocks.some(b => b.type === 'heading')) || bodyIndex > 3) fail('正文需要至少600字、三个段落、一个小标题，最多三张配图');
      const cover = textOnly ? undefined : await imageUrl(values['题图URL'], 1292, 532, 800, 1292/532);
      const thumbnail = textOnly ? undefined : await imageUrl(values['封面图URL'], 630, 411, 300, 630/411);
      articles.push({ slug: id, title, summary, date, source: values['来源'] || 'FLEET COMMAND', cover, thumbnail, body, featured: values['是否置顶'] === '是', homeSlide: values['是否首页滚动'] === '是', template, category: 'FLEET COMMAND', accent: 'ember' });
    } catch (error) { fail(`${id}/article.md：${error.message}`); }
  }
  if (articles.filter(a => a.featured).length > 1) fail('最多一篇置顶，请将旧文章的是否置顶改为否');
  if (!articles.length) fail('尚无稿件：请将 templates/news-template.md 复制到 content/news/2026-0001/article.md 并填写图片 URL');
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  console.log(`校验通过：${articles.length} 篇；未来日期 ${articles.filter(a => a.date > today).length} 篇（不会生成公开详情，日期到达后须重新运行）。`);
  if (!checkOnly) {
    const output = path.join(root,'app/news/generated-news.json');
    await fs.writeFile(`${output}.tmp`, JSON.stringify(articles,null,2)+'\n');
    await fs.rename(`${output}.tmp`, output);
    const result = spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:root,stdio:'inherit'});
    if (result.status !== 0) fail('构建失败；数据已转换，out/ 不可作为本次交付，请修复后重新运行');
    console.log('完成：out/ 包含首页、新闻总览及已发布详情。未上传或发布。');
  }
} catch (error) { console.error(`新闻生成失败：${error.message}${error.message === 'fetch failed' ? '（请检查图片 URL 是否为真实可访问地址；example.com 只是模板占位）' : ''}`); process.exitCode = 1; }
