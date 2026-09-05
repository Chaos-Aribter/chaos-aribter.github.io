#!/usr/bin/env python3
"""Refresh CACX public EVE statistics without external Python packages."""

import json
import os
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

MEMBER_CORP_IDS = (98707431, 98598862)
KILL_CORP_IDS = (98330748, 98707431)
USER_AGENT = "CACXGuildPortal/1.0 (stats cache; contact: admin@cacx.online)"
OUTPUT_FILE = Path(os.environ.get("CACX_STATS_FILE", "public/data/remote-stats.json"))


def fetch_json(url: str) -> dict:
    request = Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    with urlopen(request, timeout=15) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        return json.load(response)


def fetch_remote_stats() -> dict:
    members = 0
    for corporation_id in MEMBER_CORP_IDS:
        corporation = fetch_json(f"https://esi.evetech.net/latest/corporations/{corporation_id}/?datasource=tranquility")
        members += int(corporation.get("member_count", 0))
        time.sleep(0.25)

    kills = 0
    isk = 0
    for corporation_id in KILL_CORP_IDS:
        stats = fetch_json(f"https://zkillboard.com/api/stats/corporationID/{corporation_id}/kills/")
        kills += int(stats.get("shipsDestroyed", 0))
        isk += int(stats.get("iskDestroyed", 0))
        time.sleep(0.5)

    if members <= 0 or kills <= 0 or isk <= 0:
        raise RuntimeError("remote stats response was incomplete")
    return {
        "members": members,
        "kills": kills,
        "isk": isk,
        "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
    }


def write_atomically(stats: dict) -> None:
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_file = tempfile.mkstemp(prefix="remote-stats-", suffix=".tmp", dir=OUTPUT_FILE.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as file:
            json.dump(stats, file, ensure_ascii=False, indent=2)
            file.write("\n")
        os.replace(temporary_file, OUTPUT_FILE)
        # The cache is served by Nginx's www-data user while this timer runs
        # as root, so keep the published JSON world-readable.
        os.chmod(OUTPUT_FILE, 0o644)
    except Exception:
        os.unlink(temporary_file)
        raise


if __name__ == "__main__":
    try:
        data = fetch_remote_stats()
        write_atomically(data)
        print(f"Stats cache refreshed at {data['fetchedAt']}")
    except Exception as error:
        print(f"Stats cache refresh failed: {error}", file=sys.stderr)
        raise SystemExit(1)
