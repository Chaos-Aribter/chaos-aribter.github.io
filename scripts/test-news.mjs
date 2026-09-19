import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const command = process.platform === 'win32' ? 'test-news.bat' : 'sh test-news.sh';
if (args.includes('--help') || args.includes('-h')) {
  console.log(`用法：${command} [稿件目录或 article.md] [--build-only]`);
  process.exit(0);
}
if (args.some(arg => arg.startsWith('-') && arg !== '--build-only') || args.filter(arg => !arg.startsWith('-')).length > 1) {
  console.error('请提供一个稿件目录或 article.md 路径；可选参数仅支持 --build-only。仅校验请使用 generate-news 脚本的 --check 参数。');
  process.exit(1);
}
function run(script, scriptArgs = [], env = process.env) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script), ...scriptArgs], { cwd: root, stdio: 'inherit', env });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run('news-release-state.mjs', ['invalidate']);
run('generate-news.mjs', args);
run('news-release-state.mjs', ['record']);
if (!args.includes('--build-only')) {
  const env = { ...process.env };
  delete env.NEWS_PREVIEW_DIR;
  run('preview-news.mjs', [], env);
}
