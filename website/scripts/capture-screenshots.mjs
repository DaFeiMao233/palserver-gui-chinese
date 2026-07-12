#!/usr/bin/env node
/**
 * 對「正在運行的 palserver GUI」截圖,產生官網各語言介面截圖。
 * 需要一個可連的 agent(最好是有跑起來的 demo 實例、且支援模組的 Windows 機器,
 * 這樣 engine/mods 才有內容)。用 playwright 驅動,自動切語言、開分頁、截 1320 寬。
 *
 *   AGENT_URL=http://127.0.0.1:8250 AGENT_TOKEN=xxx \
 *     node scripts/capture-screenshots.mjs [screens...] [--langs=en,ja]
 *
 * screens 可選:login announcement engine mods(預設全部)。loopback(127.0.0.1)
 * 免 token;tailnet/遠端要帶 AGENT_TOKEN(= 你瀏覽器配對過的長 token)。
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = process.env.OUT_DIR || path.resolve(HERE, "../public/assets");
const AGENT = process.env.AGENT_URL || "http://127.0.0.1:8250";
const TOKEN = process.env.AGENT_TOKEN || "";
const W = 1320;

const argv = process.argv.slice(2);
const langArg = argv.find((a) => a.startsWith("--langs="));
const LANGS = langArg ? langArg.slice(8).split(",") : ["en", "ja"];
const screens = argv.filter((a) => !a.startsWith("--"));
const WANT = screens.length ? screens : ["login", "announcement", "engine", "mods"];

const CONN = JSON.stringify({ url: AGENT, token: TOKEN });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, lang, name) {
  const out = path.join(ASSETS, lang, name + ".jpg");
  await page.screenshot({ path: out, type: "jpeg", quality: 92, fullPage: true });
  console.log("wrote", lang + "/" + name + ".jpg");
}

/** 新 context:預設注入語言;connected=true 時再注入連線(否則走首次連線畫面)。 */
async function ctxFor(browser, lang, connected) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(
    ([lang, conn, connected]) => {
      localStorage.setItem("palserver.lang", lang);
      if (connected) localStorage.setItem("palserver.connection", conn);
      else localStorage.removeItem("palserver.connection");
    },
    [lang, CONN, connected],
  );
  return ctx;
}

async function openInstanceTab(page, tab) {
  // Dashboard → 點第一台伺服器 → 等分頁列 → 點目標分頁。
  await page.waitForSelector(".grid button, [data-testid='create-server']", { timeout: 15000 });
  const cards = page.locator(".grid button").filter({ has: page.locator("strong") });
  await cards.first().click();
  await page.waitForSelector("[data-tab='" + tab + "']", { timeout: 15000 });
  await page.locator("[data-tab='" + tab + "']").click();
  await sleep(1200);
}

async function main() {
  const browser = await chromium.launch();
  for (const lang of LANGS) {
    if (WANT.includes("login")) {
      const ctx = await ctxFor(browser, lang, false);
      const page = await ctx.newPage();
      // ?setup 強制顯示「第一次連線」畫面(否則 same-origin agent 會自動連線跳過)。
      await page.goto(AGENT + "/?setup", { waitUntil: "networkidle" });
      await sleep(1500);
      await shot(page, lang, "login");
      await ctx.close();
    }
    if (WANT.some((s) => ["announcement", "engine", "mods"].includes(s))) {
      const ctx = await ctxFor(browser, lang, true);
      const page = await ctx.newPage();
      await page.goto(AGENT, { waitUntil: "networkidle" });
      await sleep(1800);
      if (WANT.includes("announcement")) {
        // 公告彈窗會在 Dashboard 自動跳(未看過 + 啟用中的公告)。
        const popup = page.locator(".pmap-detail, [class*='overlay'], [role='dialog']");
        await sleep(600);
        await shot(page, lang, "announcement");
      }
      // 關掉可能擋路的公告彈窗:逐則點主要按鈕,最多幾次。
      for (let i = 0; i < 6; i++) {
        const btn = page.locator("button", { hasText: /開始|下一則|Next|Start|始め|次/ }).first();
        if (await btn.count().then((c) => c > 0).catch(() => false)) {
          await btn.click().catch(() => {});
          await sleep(300);
        } else break;
      }
      if (WANT.includes("engine")) {
        await openInstanceTab(page, "engine");
        await shot(page, lang, "engine");
        await page.goBack().catch(() => {});
      }
      if (WANT.includes("mods")) {
        await page.goto(AGENT, { waitUntil: "networkidle" });
        await sleep(1200);
        await openInstanceTab(page, "mods");
        await shot(page, lang, "mods");
      }
      await ctx.close();
    }
  }
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
