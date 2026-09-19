# 本地新闻转换工具

无需操作界面。支持多套 Markdown 模板，不支持直接导入 Word。使用前安装 Node.js 22 或更新版本，在项目根目录运行一次 `npm ci`。工具依赖项目现有 Next.js 所带的 sharp 图片库。

## 填写稿件

1. 创建 `content/news/2026-0001/` 文件夹。目录名为文章永久 ID，格式 YYYY-NNNN，发布后不要修改，否则详情链接会变化。
2. 将 `templates/news-template.md` 复制为该目录的 `article.md`，使用 UTF-8 保存。按模板中文字段填写，正文写在【正文】之后。模板只是短占位稿，须补足至少 600 字。
3. 在“题图URL”“封面图URL”填写可公开访问的完整 HTTP/HTTPS 图片地址；正文使用 `![描述](https://cdn.example.com/image?id=123)`。无需提供本地图片文件，URL 不限制文件名或扩展名，支持查询参数。题图、封面仍分别提供。模板中的 example.com 地址只是占位，必须替换。
4. 新增文章创建新目录；编辑文章直接修改原稿。所有目录是完整稿件库，每次整体生成，移除文章需移走对应目录。

## 执行与产物

- Windows：双击根目录 `generate-news.bat`。
- macOS：双击 `generate-news.command`，或在终端运行 `bash generate-news.sh`。
- Linux：运行 `bash generate-news.sh`。
- 指定稿件文件夹：`bash generate-news.sh /path/to/news-folder`。也可以直接传入文件：`bash generate-news.sh /path/to/news-folder/2026-0003/article.md`。文件夹内放一个或多个 `YYYY-NNNN/article.md`；传入路径后只读取该文件夹。Windows：`generate-news.bat D:\news-folder`。
- 仅校验：运行 `node scripts/generate-news.mjs --check`，不会写入数据或构建。

校验全部通过后，工具在内存中读取远程图片以校验尺寸、格式和体积，保留原始 URL 并更新 `app/news/generated-news.json`，再调用 Next.js 静态构建。`out/` 是生成的网站，包含首页、`/news` 总览和 `/news/文章ID` 详情。不单独手工维护三个页面，不自动推送或发布。构建失败时不要使用现有 out 作为本次成果。

正式稿库非空时替换原有示例新闻；没有稿件时工具报错并保留上次结果。首次尚未导入时网站保持现有演示数据。移除全部文章的空站发布暂不支持。图片不复制到网站目录，网页加载依赖源 URL 持续可访问；请使用长期有效且允许网页引用的地址。

列表及首页沿用已有排序、分页、详情上下篇和阅读时长计算。置顶冲突会报错，需将旧稿改为“否”；不静默修改原稿。未来日期使用上海时区过滤，到期须手动重新生成，无定时任务。

“是否首页滚动”字段会保存，与置顶独立；当前首页 Banner 未接入此字段，因此本工具不宣称生成了 Banner 新闻轮播。没有自动裁图、Word 导入、后台或浏览量统计能力。发布由独立 publish-news.sh 手动触发。

有图片 URL 的稿件在生成及仅校验时需要联网；纯文字稿不请求图片。链接无法访问、超时或图片不合格时终止并报告错误。图片按规范检查最小尺寸、体积、格式和题图/封面比例（2% 舍入误差）。请人工确认裁切主体、版权、错别字和真实内容。工具不会代替内容验收。

## 本地运行验收

生成成功后运行 `npm run preview:news`，打开 `http://127.0.0.1:4173`。该命令直接服务 out 静态产物，支持新闻详情的无扩展名路径；不要直接双击 HTML，也不要使用 next start 预览静态导出。按 Ctrl+C 停止。可用 PORT 环境变量调整端口。生成与发布分两步执行，完整教程见 docs/NEWS_PUBLISH_TUTORIAL.md。

## 模板类型

- `battle` 战报：会战与战绩，要求题图、封面、小标题和至少 600 字正文。
- `dispatch` 简报：训练、活动、招募，要求题图、封面、小标题和至少 600 字正文。
- `bulletin` 公告：制度、工业、补给，要求题图、封面、小标题和至少 600 字正文。
- `text` 纯文字：历史、制度说明、组织介绍；不需要题图和封面，但仍要求标题、摘要、日期、来源及至少 600 字、三个段落。模板见 `templates/news-text-template.md`。

稿件第一行填写 `模板：battle|dispatch|bulletin|text`。脚本会按类型校验，生成页面仍共用同一套详情、总览和首页新闻组件；纯文字文章仅显示文字内容。

## 按文件夹生成

脚本第一个非 `--` 参数视为稿件根目录。例如：`bash generate-news.sh ./incoming/2026-0003`（该目录可以直接包含 `article.md`（目录名须为 YYYY-NNNN），也可以包含多个文章子目录，推荐结构为 `incoming/2026-0003/article.md`、`incoming/2026-0004/article.md`）。脚本会把这批稿件作为完整数据集生成网站，因此若要保留历史稿件，应将历史稿件一并放在传入目录，或不传参数使用 `content/news/`。
