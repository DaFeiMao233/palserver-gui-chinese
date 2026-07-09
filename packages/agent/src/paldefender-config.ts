import fs from "node:fs";
import path from "node:path";
import {
  PALDEFENDER_OPTIONS,
  type PalDefenderConfig,
  type PalDefenderConfigStatus,
  type PdOptionKey,
} from "@palserver/shared";
import type { DriverContext } from "./driver.js";
import type { InstanceRecord } from "./store.js";
import { serverRoot } from "./native.js";

/**
 * Read/write the managed subset of PalDefender's Config.json.
 *
 * The file is the user's and PalDefender adds keys per version, so writes
 * merge: we set only the keys we manage and preserve everything else
 * (arrays like MOTD / bannedChatWords, unknown future keys, comments-as-keys).
 * Changes apply on the next server start or a PalDefender `reloadcfg`.
 */

function palDefenderDir(rec: InstanceRecord, ctx: DriverContext): string | null {
  const win64 = path.join(serverRoot(rec, ctx), "Pal", "Binaries", "Win64");
  for (const name of ["PalDefender", "palguard"]) {
    const dir = path.join(win64, name);
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

export function getPalDefenderConfig(rec: InstanceRecord, ctx: DriverContext): PalDefenderConfigStatus {
  if (rec.backend !== "native") {
    return { supported: false, reason: "PalDefender 設定僅支援原生模式的實例", exists: false, values: {} };
  }
  const dir = palDefenderDir(rec, ctx);
  if (!dir) {
    return { supported: false, reason: "尚未安裝 PalDefender,或伺服器尚未啟動過以生成設定檔", exists: false, values: {} };
  }
  const file = path.join(dir, "Config.json");
  if (!fs.existsSync(file)) {
    return { supported: true, exists: false, reason: "Config.json 尚未生成 — 啟動一次伺服器即會產生", values: {} };
  }

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return { supported: true, exists: true, reason: "Config.json 無法解析(格式損壞)", values: {} };
  }

  const values: PalDefenderConfig = {};
  for (const key of Object.keys(PALDEFENDER_OPTIONS) as PdOptionKey[]) {
    const v = raw[key];
    const meta = PALDEFENDER_OPTIONS[key];
    if (meta.type === "bool" && typeof v === "boolean") values[key] = v;
    else if ((meta.type === "int" || meta.type === "float") && typeof v === "number") values[key] = v;
  }
  return { supported: true, exists: true, values };
}

export function writePalDefenderConfig(
  rec: InstanceRecord,
  ctx: DriverContext,
  patch: PalDefenderConfig,
): PalDefenderConfigStatus {
  const dir = palDefenderDir(rec, ctx);
  if (!dir) throw Object.assign(new Error("找不到 PalDefender 目錄"), { statusCode: 409 });
  const file = path.join(dir, "Config.json");

  // Preserve everything already in the file; overlay our managed keys.
  let raw: Record<string, unknown> = {};
  if (fs.existsSync(file)) {
    try {
      raw = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      throw Object.assign(new Error("Config.json 格式損壞,無法安全寫入"), { statusCode: 409 });
    }
  }
  for (const [key, value] of Object.entries(patch)) {
    const meta = PALDEFENDER_OPTIONS[key as PdOptionKey];
    if (!meta) continue;
    raw[key] = meta.type === "int" ? Math.trunc(Number(value)) : value;
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 4));
  return getPalDefenderConfig(rec, ctx);
}
