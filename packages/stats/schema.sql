-- 匿名安裝(= 管理者):同一個 installId 重複回報只算一列。
CREATE TABLE IF NOT EXISTS installs (
  id TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  version TEXT,
  platform TEXT
);

-- 不重複玩家:只存單向雜湊(見 PRIVACY.md),不存原始識別碼。
CREATE TABLE IF NOT EXISTS players (
  hash TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL
);

-- 累計計數器:instance_created / server_started。
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- 雜項快取(GitHub 下載數等)。
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
