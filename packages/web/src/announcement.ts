import { useEffect, useState } from "react";

/**
 * 公告彈窗的來源:GitHub repo 裡的 markdown 檔(announcement.md),讓公告能推送給
 * 所有使用者而不必重新打包。採跟 promoConfig 相同的三層 fallback:localStorage 快取
 * -> 遠端 GitHub raw -> 內建的 /announcement.md。每則公告在 frontmatter 帶一個 `id`,
 * 彈窗依 id 只顯示一次(關閉狀態記在 localStorage),因此發佈新的 id 就能讓所有人再次看到。
 */

export interface Announcement {
  id: string;
  title: string;
  body: string; // markdown
}

const REMOTE_URL =
  "https://raw.githubusercontent.com/Wadoekeani/palserver-gui/main/announcement.md";
const LOCAL_URL = "/announcement.md";
const CACHE_KEY = "palserver.announcement";
const SEEN_KEY = "palserver.announcementsSeen";

/** 解析以 `---` 包住的 frontmatter(id/title)與 markdown 內文。 */
function parse(raw: string): Announcement | null {
  const m = raw.match(/^﻿?---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) meta[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  if (!meta.id) return null;
  return { id: meta.id, title: meta.title ?? "公告", body: m[2].trim() };
}

function readCache(): Announcement | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Announcement) : null;
  } catch {
    return null;
  }
}

function seenIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function markSeen(id: string): void {
  const ids = seenIds();
  ids.add(id);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

let shared: Announcement | null = readCache();
let fetched = false;
const listeners = new Set<(a: Announcement | null) => void>();

function publish(a: Announcement | null) {
  shared = a;
  listeners.forEach((l) => l(a));
}

async function fetchText(url: string, ms: number): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(ms) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

async function refresh(): Promise<void> {
  if (fetched) return;
  fetched = true;
  // 1) 遠端(GitHub)— 內容的權威來源。
  const remote = await fetchText(REMOTE_URL, 6000);
  if (remote !== null) {
    const ann = parse(remote);
    // 檔案空掉或被移除代表「沒有公告」— 清掉快取。
    localStorage.setItem(CACHE_KEY, JSON.stringify(ann));
    publish(ann);
    return;
  }
  // 2) 一開始沒有快取 -> 改用內建的本地副本。
  if (!readCache()) {
    const local = await fetchText(LOCAL_URL, 4000);
    if (local !== null) publish(parse(local));
  }
}

/**
 * 回傳目前「尚未看過」的公告(或 null),以及一個 dismiss():呼叫後把它標記為已看,
 * 之後就不再出現。已看過的公告會回傳 null。
 */
export function useAnnouncement(): { announcement: Announcement | null; dismiss: () => void } {
  const [ann, setAnn] = useState<Announcement | null>(shared);
  useEffect(() => {
    listeners.add(setAnn);
    void refresh();
    setAnn(shared);
    return () => {
      listeners.delete(setAnn);
    };
  }, []);

  const unseen = ann && !seenIds().has(ann.id) ? ann : null;
  return {
    announcement: unseen,
    dismiss: () => {
      if (ann) markSeen(ann.id);
      setAnn((a) => (a ? { ...a } : a)); // 觸發重繪,讓 `unseen` 重新算成 null
    },
  };
}
