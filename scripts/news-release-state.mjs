import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const receiptPath = path.join(root, '.news-release/verified-build.json');
export function git(...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim(); }
const hash = () => createHash('sha256');
async function digestFiles(base, names) {
  const digest = hash();
  for (const name of [...new Set(names)].sort()) {
    digest.update(JSON.stringify(name));
    try {
      const info = await fs.lstat(path.join(base, name));
      digest.update(String(info.mode));
      digest.update(info.isSymbolicLink() ? await fs.readlink(path.join(base, name)) : await fs.readFile(path.join(base, name)));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      digest.update('DELETED');
    }
  }
  return digest.digest('hex');
}
async function walk(dir, prefix = '') {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const name = path.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path.join(dir, entry.name), name));
    else result.push(name);
  }
  return result;
}
export async function snapshot() {
  const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  return { head: git('rev-parse', 'HEAD'), source: await digestFiles(root, files), output: await digestFiles(path.join(root, 'out'), await walk(path.join(root, 'out'))) };
}
export async function verifyReceipt() {
  let saved;
  try { saved = JSON.parse(await fs.readFile(receiptPath, 'utf8')); }
  catch { throw new Error('没有成功的生成记录，请先运行 sh test-news.sh <稿件路径> 并完成本地测试。'); }
  const current = await snapshot();
  if (['head','source','output'].some(key => saved[key] !== current[key])) throw new Error('代码、稿件或 out 产物已变化，请重新运行 test-news.sh 并测试后再发布。');
  if (saved.date !== new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())) throw new Error('生成记录已跨日期，请重新生成测试，保证发布日期筛选一致。');
  return saved;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const mode = process.argv[2];
    if (mode === 'invalidate') await fs.rm(receiptPath, {force:true});
    else if (mode === 'record') {
      await fs.access(path.join(root,'out/index.html'));
      await fs.access(path.join(root,'out/news.html'));
      await fs.mkdir(path.dirname(receiptPath),{recursive:true});
      const state = await snapshot();
      await fs.writeFile(receiptPath,JSON.stringify({...state,date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())},null,2)+'\n');
      console.log('生成记录已保存。请在本地检查首页、总览、详情；测试通过后再执行 sh publish-news.sh。');
    } else throw new Error('未知操作');
  } catch(error) { console.error(error.message);process.exitCode=1; }
}
