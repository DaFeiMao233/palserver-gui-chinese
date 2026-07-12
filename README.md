# palserver GUI

**简体中文**

<p align="center"><a href="https://palserver-GUI.iosoftware.ai"><b>官方网站 palserver-GUI.iosoftware.ai</b></a> —— 下载、教程、常见问题</p>

**幻兽帕鲁（Palworld）专用服务器的图形化管理工具。**
在你的主机上运行一个 agent，然后用浏览器管理服务器 —— 开服、改设置、看玩家、备份存档、装模组，全都不用碰命令行。

手机、平板、另一台电脑都能连进来管理；朋友也可以用一条链接加入管理。

```
浏览器（React Web UI）
        │  HTTP / WebSocket（Bearer token）
        ▼
   agent（Node/TypeScript，Fastify）
        ├── native 后端（默认）：直接在主机上启动 PalServer，不需要 Docker
        └── docker 后端（beta）：把 PalServer 跑在容器里
```

---

## 画面预览

> 界面支持简体中文 / 繁体中文 / English / 日本語，以及浅色 / 深色主题；截图中的玩家与数据仅供展示。

![玩家管理](docs/screenshots/players.png)

| 仪表盘 | 世界设置 |
| --- | --- |
| ![仪表盘](docs/screenshots/dashboard.png) | ![世界设置](docs/screenshots/settings.png) |
| **引擎微调** | **存档备份** |
| ![引擎微调](docs/screenshots/engine.png) | ![存档备份](docs/screenshots/saves.png) |
| **模组管理** | **实例总览** |
| ![模组管理](docs/screenshots/mods.png) | ![实例总览](docs/screenshots/overview.png) |

---

## 这份文档怎么看

| 你是… | 从这里开始 |
| --- | --- |
| **玩家 / 开服的人** —— 只想把服务器开起来 | [给玩家：五分钟开服](#给玩家五分钟开服) |
| **服务器管理员** —— 要长期运营、在意安全与自动化 | [给管理员：运营指南](#给管理员运营指南) |
| **开发者** —— 想改程序、提交 PR | [给开发者：开发指南](#给开发者开发指南) |

遇到问题先看 **[常见问题 FAQ](https://faq.toc.icu/)**，或到 [Discord](https://discord.gg/sgMMdUZd3V) 提问。

---

## 功能总览

**开服与管理**
- 创建多个服务器实例，各自拥有独立的世界、端口与设置；一键启动 / 停止 / 重启 / 删除（删除会保留存档）
- 自动下载安装 Palworld 服务器文件（通过 DepotDownloader），或**直接接管你已有的安装目录**
- 游戏版本检查：对比已安装版本与 Steam 上的最新版本，一键更新服务器
- 实时日志流（agent / 游戏 / PalDefender 三种来源可切换）

**世界与性能设置**
- 80+ 项世界设置的图形化编辑器，按分类分页，包含类型、范围与默认值；也可以直接编辑原始 `PalWorldSettings.ini`
- `Engine.ini` 性能微调（tick rate、网络速率、超时、GC 间隔等），附带一键性能预设
- 设置文件损坏时自动检测，并提供“重建干净设置文件”（坏文件会先备份，不会直接删除）

**玩家管理**
- 在线玩家列表：等级、延迟、坐标、建筑数，点进去可查看**他的帕鲁与背包**（需要 PalDefender）
- 踢出、封锁、白名单 —— **离线玩家也能操作**（例如帮人解封）
- 历史玩家名册：agent 每 15 秒记录一次，保留游玩时长、上线次数、首次/最后上线；上下线时间轴
- 全服广播、立即存档
- 实时地图：把在线玩家标在地图上（地图底图需自备，见下方说明）

**控制台**
- 完整的 RCON 控制台，指令支持搜索、分类与参数表单；危险指令需要二次确认
- 需要玩家 ID 的参数会弹出玩家选择器（含离线玩家）；道具 / 帕鲁 / 蛋的 ID 支持图标搜索
- 安装 PalDefender 后会自动把它的指令加入进来

**存档与备份**
- 定时自动备份：间隔、保留份数、无人在线时跳过
- 手动备份 / 还原 / 下载；还原前会自动先备份当前世界
- 多世界管理：列出所有世界、切换“启用中的世界”、删除单个玩家存档
- 存档迁移教程（从其他服务器、从 v1、从本机多人）：[docs/MIGRATION.md](docs/MIGRATION.md)

**模组**
- 一键安装 / 更新 / 移除 **PalDefender**（反外挂，前身 Palguard）与 **UE4SS**（Lua/蓝图模组加载器），各有稳定版与测试版通道
- PalDefender 设置面板、Lua 模组开关、pak 模组管理
- 文件管理器：浏览、上传、编辑、删除服务器目录下的文件

**稳定性**
- 自动重启：定时（固定间隔或每日指定时间）、内存超标、崩溃自动恢复（有每小时上限，避免无限重启循环）
- 重启前会先广播倒计时并存档；手动停止不会被当成崩溃

**其他**
- 三种语言：简体中文 / 繁体中文 / English / 日本語；浅色 / 深色主题
- 连接诊断：检测公网 IP、是否在 NAT/CGNAT 后面，并提供 VPN（Tailscale / Radmin）开服教程
- GUI 自我更新（可选）：从 GitHub Releases 检查新版，验证 SHA256 后替换文件并重启

---

## 系统需求

| 项目 | 说明 |
| --- | --- |
| **操作系统** | **Windows 10+ 或 Linux（x86_64）**。macOS 可以运行 agent，但**跑不了 Palworld 服务器**（SteamCMD/PalServer 不支持），只能用于开发或管理远程主机。 |
| **硬件** | 按 Palworld 官方需求；服务器文件本身数十 GB，首次安装需要等待一段时间 |
| **Node.js** | **不需要**（免安装执行文件已内置）。从源码运行才需要 Node 20+ 与 pnpm |
| **Docker** | 不需要。只有选用 docker 后端（beta）时才需要 |

---

## 给玩家：五分钟开服

> 完整的图文教程（含邀请朋友、VPN 设置）：**[docs/INSTALL.zh-TW.md](docs/INSTALL.zh-TW.md)**

1. 到 [Releases](https://github.com/io-software-ai/palserver-gui/releases) 下载你系统对应的压缩包
   （`palserver-agent-windows.zip` / `-linux.zip`），解压。
2. 运行里面的 `palserver-agent`（Windows 是 `palserver-agent.exe`）。不用先安装 Node 或 Docker。
3. 窗口会打印一段说明，照着打开 **`http://localhost:8250`** —— 本机管理**不需要密码**。
4. 点击“创建服务器”。第一次会下载 Palworld 服务器文件（**数十 GB，请耐心等待**），进度看“日志”分页。
5. 安装好后点击“启动”就开服了。

**邀请朋友一起管理：** 启动窗口里有一条 `?setup=XXXX-XXXX` 的链接，发给对方在他的浏览器打开就能连进来
（需要在同一个局域网或 VPN 内）。也可以请他打开你的 agent 地址后输入**配对码**。

**让朋友连进游戏：** 最简单的方式是 VPN（Tailscale 或 Radmin），GUI 的“连接”卡片会检测你的网络环境并给出对应教程。
如果你有公网 IP，也可以走传统的端口转发（UDP 8211）。

> **关于地图底图：** 游戏地图是 Pocketpair 的美术资产，我们不能附带，所以“实时地图”默认是空白的 —— 请自己粘贴一张图片网址或上传文件，再用校准工具对齐。

---

## 给管理员：运营指南

### 安全模型

agent 只有一道门：**本机（loopback）免验证，其他一律要 token。**

- **本机管理**（`127.0.0.1`）不需要任何凭证 —— 单机自用零阻力。
- **其他设备**要么带 API token（`Authorization: Bearer <token>`），要么用**配对码**换取一个 token。
  配对码是好读的 `XXXX-XXXX`（去掉了易混淆的字符），可随时重新生成，旧码与旧链接会立刻失效。
- token 存在数据文件夹里（权限 `0600`），第一次启动时生成并打印在窗口上。
- 多人共用的主机请设置 `PALSERVER_REQUIRE_TOKEN=1`，连 loopback 也要 token。

> agent 会直接操作主机上的文件与进程，**不要把 `:8250` 直接暴露在公网**。要远程管理，请走 VPN（Tailscale/WireGuard），或放在反向代理后面并开启 TLS。

### 环境变量

| 变量 | 默认 | 用途 |
| --- | --- | --- |
| `PALSERVER_DATA_DIR` | `~/.palserver-agent` | 所有状态的存放位置 |
| `PALSERVER_AGENT_PORT` | `8250` | 监听端口 |
| `PALSERVER_AGENT_HOST` | `0.0.0.0` | 绑定地址 |
| `PALSERVER_REQUIRE_TOKEN` | 未设置 | `=1` 时连本机也要 token |
| `PALSERVER_TLS` | 未设置 | `=1` 以 HTTPS 监听（自签证书自动生成于 `<data-dir>/tls`，也可放自己的） |
| `PALSERVER_WEB_ORIGINS` | 空 | 允许跨源连接的网站来源（逗号分隔），给独立部署的公开 web 站使用 |
| `PALSERVER_AUTO_UPDATE` | 未设置 | `=0` 完全停用 GUI 自我更新（连检查都不做） |
| `PALSERVER_TELEMETRY` | 未设置 | `=0` 强制停用匿名使用统计 |
| `PALSERVER_STATS_URL` | 官方统计端点 | 改成自建的统计后端 |
| `PALSERVER_GITHUB_REPO` | `io-software-ai/palserver-gui` | 自我更新要查看哪个 repo 的 Releases |
| `PALSERVER_IMAGE_VANILLA` | `palserver/vanilla:latest` | docker 后端使用的镜像 |

### 数据放在哪里

```
~/.palserver-agent/
├── token                 API token（0600）
├── pair-code             配对码（0600）
├── instances.json        所有实例的设置（设置的唯一真实来源）
├── tools/                缓存的 DepotDownloader
├── tls/                  自签证书（PALSERVER_TLS=1 时）
└── instances/<id>/
    ├── server/           agent 自己安装的服务器文件（接管已有安装时不会有）
    ├── server.pid        游戏进程 pid
    ├── server.log        agent 捕获到的服务器输出
    └── backups/          tar.gz 备份
```

服务器进程是以 **detached** 方式生成的，agent 重启（或自我更新）**不会**把游戏服务器一起关掉；pid 文件会让 agent 重新接上。

### 部署方式

**免安装执行文件（推荐）** —— 就是玩家那条路，适合绝大多数人。

**用 Docker 运行 agent 本身**（Linux 主机）：

```sh
docker compose up -d          # 见 docker-compose.yml
```

需要挂载 `docker.sock`，而且 host 上的文件夹路径要与容器内一致（实例目录会被 bind-mount 进游戏容器）。

**纯 web 站 + 远程 agent** —— Release 里的 `palserver-web.zip` 是可独立部署的前端；把站点网址加入 agent 的
`PALSERVER_WEB_ORIGINS`，玩家就能从公开站点连回自己家里的 agent。

**从源码** —— 见下方[开发指南](#给开发者开发指南)；`pnpm release:exe` 可以自己生成免安装执行文件。

### 自我更新

在“设置 → GUI 更新”。默认**只检查、不安装**（每 6 小时），查到新版会显示更新卡片，点击后才会执行：
下载对应平台的 `.tar.gz` → **比对 `SHA256SUMS.txt`** → 替换执行文件与前端 → 重启自己。也可以开启“自动安装”。

安全设计：没有校验文件就拒绝更新；非免安装执行文件（例如开发模式）拒绝自我更新；有服务器正在安装文件时拒绝更新
（下载器是 agent 的子进程，重启会中断它）；替换文件失败会把旧执行文件移回去。

### 隐私与匿名统计

GUI 会回报**匿名**的使用计数（安装数、服务器创建/启动数、不重复玩家数），用于了解使用规模。
不含个人信息、IP、服务器名称或存档内容；玩家识别码只发送单向哈希。
可在“设置”关闭，或用 `PALSERVER_TELEMETRY=0` 强制停用。完整说明：**[PRIVACY.md](PRIVACY.md)**。

---

## 给开发者：开发指南

### 架构

前端**永远不直接碰**游戏的 REST API、RCON 或 PalDefender 的 API —— 那些凭证只留在 agent 里，浏览器只跟 agent 通信。

| 包 | 内容 |
| --- | --- |
| `packages/agent` | Fastify daemon：REST + WebSocket API、进程管理、RCON、备份、模组安装、自我更新 |
| `packages/web` | React 18 + Vite + Tailwind 4 的 Web UI |
| `packages/shared` | 共用的 zod schema 与 API 类型（世界设置、实例契约） |
| `packages/stats` | Cloudflare Worker + D1，匿名统计收集端 |
| `images/vanilla` | docker 后端用的 Linux PalServer 镜像（内置 DepotDownloader） |
| `images/dev-stub` | 假的 PalServer，给 Apple Silicon 开发用 |
| `deperated/` | v1 的 Electron 版，仅保留作 UX/i18n 参考，不属于这个 workspace |

### 开始开发

需要 Node 20+ 与 pnpm 11。

```sh
pnpm install
pnpm build

pnpm dev:agent    # 终端 1 — agent（第一次会打印 API token）
pnpm dev:web      # 终端 2 — Web UI on http://localhost:5173
```

agent 默认监听 `:8250`。当 `packages/web/dist` 存在时，agent 会自己 serve 前端（合一版）。

| 指令 | 做什么 |
| --- | --- |
| `pnpm typecheck` | 全 workspace 类型检查（CI 会跑） |
| `pnpm build` | 全部构建 |
| `pnpm bundle:agent` | esbuild 打包成单一 CJS |
| `pnpm release:exe` | 生成当前平台的免安装执行文件到 `release/` |

### 世界设置是 schema 驱动的

`packages/shared/src/options.ts` 是**唯一真实来源**：每个选项的类型、默认值、范围与分类都在那里
（按[官方文档](https://docs.palworldgame.com/)校对）。zod schema、agent 的 ini 序列化、前端的设置编辑器全部由它衍生 ——
**在那里加一个选项，整条链路就通了**。中文标签在 `packages/web/src/labels.ts`。

`Engine.ini` 与 PalDefender 的 `Config.json` 也是同样做法，而且**写入时采用合并策略**：GUI 不管的区段、键与注释都会原样保留。

### i18n

代码里的字符串一律写**中文原文**，`t("中文")` 用原文当 key 查字典。
`packages/web/public/i18n/{en,ja}.json` 是“中文 → 译文”对照表，查不到就显示中文原文，所以**漏翻不会破坏版面**。
字典会在后台从 GitHub raw 拉取最新版，翻译修正不用重新发版。

### 在 Apple Silicon 上开发

真正的服务器在 Rosetta 下跑不起来（SteamCMD 是 32-bit；PalServer 一存档就 segfault）。UI/agent 开发请用假服务器：

```sh
docker build -t palserver/dev-stub:latest images/dev-stub
PALSERVER_IMAGE_VANILLA=palserver/dev-stub:latest pnpm dev:agent
```

真服务器的验证需要一台 x86_64 的 Windows 或 Linux。

### 发布

推一个 `v*` tag，[release workflow](.github/workflows/release.yml) 会在三种 OS 上分别生成：

- `palserver-agent-<os>.zip` —— 给用户手动下载
- `palserver-agent-<os>.tar.gz` —— 给自我更新使用
- `palserver-web.zip` —— 可独立部署的前端
- `SHA256SUMS.txt` —— 自我更新一定会验证它

---

## 现状

**v2 目前是 alpha**（`2.0.0-alpha.0`）。上面列的功能都已经可用，但**还没有发布第一个 Release** ——
在那之前请从源码构建（`pnpm release:exe`）。API 仍可能变动。

尚未完成：多主机聚合管理；Docker 后端仍标为 beta（`images/modded` 尚未提供）；PalDefender 的帕鲁导入规则等进阶功能。
规划见 [TODO.md](TODO.md)。

## 授权与链接

**[PolyForm Noncommercial 1.0.0](LICENSE.md)** —— 源码公开，个人与非商业用途可自由使用、
修改与分发；**禁止任何商业/盈利用途**（出售本软件，或把它打包进付费服务等）。
如需商业授权，请联系 <contact@iosoftware.ai>。

> *License: source-available under PolyForm Noncommercial 1.0.0 — free for personal and
> noncommercial use; **commercial use is not permitted**. Contact us for commercial licensing.*

- **官方网站：** <https://palserver-GUI.iosoftware.ai>
- **常见问题：** <https://faq.toc.icu/>
- **Discord：** <https://discord.gg/sgMMdUZd3V>
- **安装与连接教程（玩家向）：** [docs/INSTALL.zh-TW.md](docs/INSTALL.zh-TW.md)
- **存档迁移：** [docs/MIGRATION.md](docs/MIGRATION.md)
- **隐私政策：** [PRIVACY.md](PRIVACY.md)
- **v1（已停止维护）：** <https://github.com/Dalufishe/palserver-GUI>

由 [Dalufish](https://github.com/Dalufishe) 与核心团队用爱制作。