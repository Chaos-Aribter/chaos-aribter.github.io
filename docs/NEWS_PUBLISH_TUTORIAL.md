# 新闻运营教程：填写模板 → 生成 → 本地测试 → 发布 Pages

## 1. 一次性准备

电脑安装 Node.js 22 或更新版本、Git；终端进入项目目录，安装依赖：

```sh
cd /Users/yuanhaodu/work/pg/cacx-eve
npm ci
```

发布还需要 GitHub 仓库推送权限、配置好的 Git 作者信息。仓库 origin 应指向 `Chaos-Aribter/chaos-aribter.github.io`，当前分支为 main。GitHub 的 Settings → Pages 使用 GitHub Actions，并允许现有 Pages 工作流运行。这些账号/仓库配置不会由脚本擅自修改。

### Windows 快速操作

安装 Node.js 22 和 Git for Windows，在项目目录打开命令提示符（CMD），先运行 `npm ci`。以下假定已填写好现有纯文字稿，目录含空格或中文时务必加双引号：

```bat
REM 第一步：生成并启动本地预览，不提交、不发布
test-news.bat "content\news\2026-0003\article.md"

REM 浏览器访问 http://127.0.0.1:4173，验收后 Ctrl+C 停止
REM 第二步：检查待发布内容，不提交、不推送
publish-news.bat --check

REM 第三步：提交并推送，输入 PUBLISH 后触发 Pages
publish-news.bat "发布混沌历史新闻"
```

批量稿件同样支持 `test-news.bat "D:\新闻稿"`，单篇目录支持 `test-news.bat "content\news\2026-0003"`。输入目录是完整数据集，会替换此前生成的数据，详见第 3 节。

只构建不启动预览：`test-news.bat "content\news\2026-0003\article.md" --build-only`；随后可运行 `npm run preview:news`。更换端口时先在 CMD 执行 `set PORT=4174`。原有 `generate-news.bat` 仅生成，不保存发布检查记录；要发布请使用 `test-news.bat`。

在 PowerShell 中调用时加 `.\` 前缀，例如 `.\test-news.bat "content\news\2026-0003\article.md"` 和 `.\publish-news.bat --check`。建议在已打开的终端执行，不直接双击，以便看到失败信息。两个新入口会保留失败退出码，任何校验或构建失败都会停止，不继续预览或发布。`.bat` 与 `.sh` 共用同一套 Node.js 实现。

## 2. 选择并填写模板

| 类型 | 模板文件 | 首行 | 图片 |
| --- | --- | --- | --- |
| 战报 | templates/news-template.md | 模板：battle | 必填题图、封面 URL |
| 简报 | templates/news-dispatch-template.md | 模板：dispatch | 必填题图、封面 URL |
| 公告 | templates/news-bulletin-template.md | 模板：bulletin | 必填题图、封面 URL |
| 纯文字 | templates/news-text-template.md | 模板：text | 不需要图片 |

前三种是不同内容提纲，共用图文排版；纯文字在首页、总览和详情不显示图片占位。

例如创建新的纯文字新闻（选未使用的文章 ID，避免覆盖已有稿）：

```sh
mkdir -p content/news/2026-0004
cp -n templates/news-text-template.md content/news/2026-0004/article.md
```

用文本编辑器打开 article.md，填写：

- 标题：中文最多 60 字；英文最多 80 字。
- 副标题：最多 120 字。
- 发布日期：YYYY-MM-DD，请替换模板示例日期。
- 来源：可留空，默认 FLEET COMMAND。
- 是否置顶、是否首页滚动：填“是”或“否”。同一批最多一篇置顶；首页滚动字段目前保存但 Banner 尚未接入。
- 正文：写在【正文】之后，至少 600 字、三个空行分隔的段落；图文模板还需至少一个 `## 小标题`。

模板示例正文很短，不能直接通过校验。支持二级标题、普通段落、`- 要点`、`> 引用`，图文稿可用 `![说明](完整图片URL)` 和下一行 `*图注*`。禁止普通外链、表格、HTML、视频和自定义格式。保存为 UTF-8。

图文稿必须将 example.com 占位 URL 换成真实地址，题图与封面分别提供。尺寸与体积详见 NEWS_GUIDELINES.md，脚本会联网检查。纯文字稿不填这两项。

## 3. 生成并启动本地预览

已有“混沌历史”纯文字稿，可直接测试：

```sh
sh test-news.sh content/news/2026-0003/article.md
```

也可传单篇目录或批量目录（有空格的路径要加引号）：

```sh
sh test-news.sh content/news/2026-0003
sh test-news.sh "/Users/你的用户名/Documents/新闻稿"
```

批量目录结构：

```text
新闻稿/
├── 2026-0003/
│   └── article.md
└── 2026-0004/
    └── article.md
```

不传路径则读取项目 content/news。当前该目录里还有 2026-0002 图文旧稿，图片为占位 URL；因此现在测试纯文字请使用上面的单篇命令。

**每次输入是完整新闻数据集，不是追加。**只传一篇，网站就只保留这一篇；要保留历史文章，请把所有要发布的稿件放到同一批量目录一起生成。外部文件夹不自动复制进 Git；生成 JSON 会进入项目，原稿请自行备份或移入 content/news。

脚本依次校验稿件、生成 app/news/generated-news.json、构建 out、保存本次生成记录，成功后启动本地预览：

- 首页：http://127.0.0.1:4173/
- 新闻总览：http://127.0.0.1:4173/news
- 示例详情：http://127.0.0.1:4173/news/2026-0003

请预览 4173 的静态产物，避免把 8999 开发页面误当成此次构建结果。端口占用可改用：

```sh
PORT=4174 sh test-news.sh content/news/2026-0003/article.md
```

只生成不启动预览：

```sh
sh test-news.sh content/news/2026-0003/article.md --build-only
npm run preview:news
```

原有 `sh generate-news.sh <路径>` 仍然只生成，但不会出具发布检查记录。正式发布流程请使用 test-news.sh。

## 4. 本地验收

检查标题、正文、日期和图片；首页入口、总览卡片、详情与返回链接；两列瀑布流、手机单列及分页；纯文字没有图片占位。刷新详情确认能够直接打开。测试没问题后，在终端按 Ctrl+C 停止预览。

如果有问题，修改 Markdown 或代码，再运行 test-news.sh。生成失败就先修复错误，不要发布旧 out。未来日期不会生成详情，到期须重新构建；目前不要依赖客户端筛选实现定时发布。

## 5. 测试通过后提交并发布

先查看将要发布的内容（此命令不联网、不提交、不推送）：

```sh
sh publish-news.sh --check
```

确认后执行：

```sh
sh publish-news.sh "发布混沌历史新闻"
```

脚本会：

1. 验证本地成功生成记录与当前源码、产物、日期一致。
2. 列出所有将提交的文件，检查 main 分支及 origin 地址，并获取远端 main，要求本地已包含远端全部提交；已有未推送的本地提交会列出并一并推送。
3. 等待你输入 `PUBLISH`，表示已测试且同意提交列表里的全部改动。
4. 执行 git add --all、git commit，再推送 origin/main。
5. 输出提交编号和 Pages 工作流地址。现有工作流收到 push 后会构建并部署。

**这是提交整个项目当前非忽略改动的脚本，不只提交文章。**首次会包含新闻功能的新增代码、样式、模板、文档，以及已有待提交改动。请逐项看清文件清单；不想一起发布的工作请先单独整理好，再生成测试。out、node_modules、构建缓存和本地验收记录不上传 Git。

Actions：https://github.com/Chaos-Aribter/chaos-aribter.github.io/actions/workflows/pages.yml

找到脚本打印的提交对应的运行，等待部署成功，再访问工作流显示的站点地址复查。推送成功不等于上线成功。本脚本不保存 GitHub Token，也不会绕过 GitHub 登录或权限检查。

## 6. 常见问题

- **生成后修改了文件 / 已跨日期**：重新运行 test-news.sh，并重新验收。
- **本地尚未包含远端 main 的全部提交**：先查看 git status、处理本地改动并同步，再重新生成测试；脚本不自动合并或强推。本地仅领先远端时允许发布。仓库已有定时统计任务，可能更新远端 main。
- **推送失败**：本地提交仍保留。排查网络和权限、确认远端状态后可执行 `git push origin main`；不要强推。若要重新修改提交，重新走生成测试流程。
- **没有待提交内容**：不创建空提交。若只是重试失败的部署，可在 GitHub Actions 页面重跑对应任务。
- **fetch failed / 图片超限**：替换真实图片 URL，检查尺寸、体积和访问权限。
- **缺少字段：模板**：在首行补上 `模板：text` 或对应图文类型。

现有工作流还包含每 30 分钟定时运行配置；它使用远端已提交版本，不读取本机稿件。本文新增脚本不会改变该调度，也不会在生成阶段推送任何文件。
