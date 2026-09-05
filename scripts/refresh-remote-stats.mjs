import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Membership is reported by EVE's official ESI. Kill totals and ISK value are
// the lifetime zKillboard totals for the corporation groups used by CACX.
const MEMBER_CORP_IDS = [98707431, 98598862];
const KILL_CORP_IDS = [98330748, 98707431];
const USER_AGENT = "CACXGuildPortal/1.0 (stats cache; contact: admin@cacx.online)";
const outputFile = process.env.CACX_STATS_FILE ?? path.resolve("public/data/remote-stats.json");

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function fetchRemoteStats() {
  let members = 0;
  for (const corporationId of MEMBER_CORP_IDS) {
    const corporation = await fetchJson(`https://esi.evetech.net/latest/corporations/${corporationId}/?datasource=tranquility`);
    members += Number(corporation.member_count) || 0;
    await sleep(250);
  }

  let kills = 0;
  let isk = 0;
  for (const corporationId of KILL_CORP_IDS) {
    const stats = await fetchJson(`https://zkillboard.com/api/stats/corporationID/${corporationId}/kills/`);
    kills += Number(stats.shipsDestroyed) || 0;
    isk += Number(stats.iskDestroyed) || 0;
    await sleep(500);
  }

  if (![members, kills, isk].every(Number.isFinite) || members <= 0 || kills <= 0 || isk <= 0) {
    throw new Error("Remote stats response was incomplete");
  }
  return { members, kills, isk, fetchedAt: new Date().toISOString() };
}

async function main() {
  const stats = await fetchRemoteStats();
  await mkdir(path.dirname(outputFile), { recursive: true });
  const temporaryFile = `${outputFile}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(stats, null, 2)}\n`, "utf8");
  await rename(temporaryFile, outputFile);
  console.log(`Stats cache refreshed at ${stats.fetchedAt}`);
}

main().catch((error) => {
  console.error(`Stats cache refresh failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
