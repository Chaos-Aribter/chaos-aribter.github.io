import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { root, git, verifyReceipt } from './news-release-state.mjs';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const message = args.find(arg => !arg.startsWith('--')) || 'content: publish news';
const expected = 'Chaos-Aribter/chaos-aribter.github.io';
const actions = `https://github.com/${expected}/actions/workflows/pages.yml`;
function run(...argv) {
 const result = spawnSync('git',argv,{cwd:root,stdio:'inherit'});
 if (result.status !== 0) throw new Error(`git ${argv[0]} 失败，已停止；不会强推或自动合并。`);
}
try {
 if (args.includes('--help') || args.includes('-h')) {
  const command = process.platform === 'win32' ? 'publish-news.bat' : 'sh publish-news.sh';
  console.log(`用法：${command} ["提交说明"] [--check]\n--check 只检查生成记录和待提交文件，不提交、不推送。`);
 } else {
  for (const arg of args) if (arg.startsWith('--') && arg !== '--check') throw new Error(`未知参数：${arg}`);
  if (git('branch','--show-current') !== 'main') throw new Error('请在 main 分支发布，脚本不会自动切换分支。');
  const remote = git('remote','get-url','--push','origin');
  if (![ `https://github.com/${expected}.git`, `https://github.com/${expected}`, `git@github.com:${expected}.git` ].includes(remote)) throw new Error(`origin 推送地址与预期仓库不一致：${remote}`);
  await verifyReceipt();
  await fs.access(`${root}/.github/workflows/pages.yml`);
  console.log(`目标：${remote}\n分支：main\n提交说明：${message}\n本次将提交下列全部非忽略改动（包括已暂存文件）：\n`);
  const changes = git('status','--short');
  console.log(changes || '没有待提交改动');
  if (!checkOnly) {
   if (!changes) throw new Error('没有新的改动，不创建空提交或重复部署。');
   run('fetch','origin','main');
   const baseline = spawnSync('git',['merge-base','--is-ancestor','FETCH_HEAD','HEAD'],{cwd:root});
   if (baseline.status !== 0) throw new Error('本地尚未包含远端 main 的全部提交。请先同步远端，再重新生成测试；脚本不自动合并或强推。');
   const pending = git('log','--oneline','FETCH_HEAD..HEAD');
   if (pending) console.log(`\n以下本地提交也将一并推送：\n${pending}`);
   if (!process.stdin.isTTY) throw new Error('请在终端交互运行；需要确认测试通过后再发布。');
   const rl = createInterface({input:process.stdin,output:process.stdout});
   let answer;
   try {answer=await rl.question('\n确认已本地测试通过，并提交以上全部改动、推送触发 Pages？输入 PUBLISH：');} finally {rl.close();}
   if (answer !== 'PUBLISH') throw new Error('已取消，未提交或推送。');
   await verifyReceipt();
   run('add','--all');
   run('diff','--cached','--check');
   run('commit','-m',message);
   try { run('push','origin','HEAD:main'); }
   catch(error) {throw new Error(`${error.message}\n本地提交已保留，请查看 git status；确认远端状态后可运行 git push origin main 重试。`);}
   console.log(`\n已推送提交 ${git('rev-parse','--short','HEAD')}，Pages 工作流由 push 触发。\n这不代表部署已成功，请查看对应提交的运行结果：\n${actions}`);
  } else console.log(`\n本地检查通过。未联网核对远端、未暂存、未提交、未推送。\n正式发布后在此查看 Pages 结果：${actions}`);
 }
} catch(error) {console.error(`发布停止：${error.message}`);process.exitCode=1;}
