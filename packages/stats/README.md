# @palserver/stats — 匿名使用統計後端

Cloudflare Worker + D1,收集 palserver GUI 的匿名使用統計(隱私原則見根目錄
[PRIVACY.md](../../PRIVACY.md)),並彙總 GitHub Releases 下載數。

## 端點

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| `POST` | `/api/event` | agent 回報事件:`hello`(啟動)、`instance_created`、`server_started`、`players_seen`(玩家雜湊批次) |
| `GET` | `/api/stats` | 公開彙總:`downloads` / `admins` / `players` / `instancesCreated` / `serverStarts` |

## 部署(一次性)

```bash
cd packages/stats
npx wrangler login                        # 登入 Cloudflare 帳號
npx wrangler d1 create palserver-stats    # 建 D1,把回傳的 database_id 填進 wrangler.toml
pnpm db:schema                            # 建表(schema.sql)
pnpm deploy                               # 部署 worker
```

部署完成會得到 `https://palserver-stats.<你的帳號>.workers.dev`(也可在
Cloudflare 後台綁自訂網域)。**把這個網址更新到兩個地方:**

1. `packages/agent/src/env.ts` 的 `STATS_URL` 預設值
2. `packages/web/src/stats.ts` 的 `STATS_URL`

agent 端也可用環境變數 `PALSERVER_STATS_URL` 覆寫,不改码就能切換端點。

## 之後改 schema / 重新部署

```bash
pnpm db:schema   # schema.sql 全部是 IF NOT EXISTS,可重複執行
pnpm deploy
```
