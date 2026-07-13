/**
 * 授權管理後台(單頁,worker 的 GET /admin 直接吐這串 HTML)。
 * 頁面本身公開;所有操作都要在頁內輸入 ADMIN_TOKEN,呼叫 /api/license/* 時帶
 * X-Admin-Token(存在 sessionStorage,關掉分頁即清)。
 *
 * 注意:這是「外層 TS template literal」,字串內請勿使用反引號或 ${...}
 * (會被 TS 當成插值)。頁內 JS 一律用單/雙引號 + 字串相接。
 */
export const ADMIN_HTML = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>palserver GUI · 授權後台</title>
<style>
  :root{
    --bg1:#eef4ff; --bg2:#f7fbf9; --card:#ffffff; --ink:#0f172a; --muted:#64748b;
    --line:#e6ebf2; --soft:#f1f5f9; --accent:#10b981; --accent-d:#059669;
    --danger:#ef4444; --warn:#f59e0b; --info:#6366f1; --radius:18px;
    --shadow:0 10px 30px rgba(15,23,42,.08),0 2px 6px rgba(15,23,42,.05);
  }
  @media (prefers-color-scheme: dark){
    :root{ --bg1:#0b1220; --bg2:#0e1627; --card:#151e30; --ink:#e8eefb; --muted:#93a1b8;
      --line:#243043; --soft:#1c2740; --shadow:0 10px 30px rgba(0,0,0,.4); }
  }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang TC","Noto Sans TC",sans-serif;
    color:var(--ink); background:linear-gradient(160deg,var(--bg1),var(--bg2)); min-height:100vh;
    -webkit-font-smoothing:antialiased; }
  .wrap{ max-width:1000px; margin:0 auto; padding:28px 20px 80px; }
  header{ display:flex; align-items:center; gap:12px; margin-bottom:22px; }
  .logo{ width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg,var(--accent),var(--info));
    display:grid; place-items:center; color:#fff; font-weight:900; box-shadow:var(--shadow); }
  h1{ font-size:19px; margin:0; font-weight:800; letter-spacing:.3px; }
  .sub{ color:var(--muted); font-size:13px; margin-top:2px; }
  .spacer{ flex:1; }
  .card{ background:var(--card); border:1.5px solid var(--line); border-radius:var(--radius);
    box-shadow:var(--shadow); padding:22px; margin-bottom:20px; }
  .card h2{ font-size:15px; margin:0 0 4px; font-weight:800; display:flex; align-items:center; gap:8px; }
  .card .hint{ color:var(--muted); font-size:12.5px; margin:0 0 16px; }
  label{ display:block; font-size:12.5px; font-weight:700; color:var(--muted); margin-bottom:6px; }
  input[type=text],input[type=number],input[type=date],input[type=password]{
    width:100%; padding:10px 12px; border:1.5px solid var(--line); border-radius:12px; background:var(--soft);
    color:var(--ink); font-size:14px; font-family:inherit; }
  input:focus{ outline:none; border-color:var(--accent); background:var(--card); }
  .grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; }
  .seg{ display:inline-flex; background:var(--soft); border:1.5px solid var(--line); border-radius:12px; padding:3px; gap:2px; }
  .seg button{ border:0; background:transparent; color:var(--muted); font-weight:700; font-size:13px;
    padding:7px 14px; border-radius:9px; cursor:pointer; font-family:inherit; }
  .seg button.on{ background:var(--card); color:var(--ink); box-shadow:0 1px 4px rgba(15,23,42,.12); }
  .row{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .btn{ border:0; border-radius:999px; padding:11px 20px; font-weight:800; font-size:14px; cursor:pointer;
    font-family:inherit; background:var(--accent); color:#fff; box-shadow:0 6px 16px rgba(16,185,129,.28);
    transition:transform .08s, filter .15s; }
  .btn:hover{ filter:brightness(1.05); } .btn:active{ transform:translateY(1px); }
  .btn:disabled{ opacity:.5; cursor:not-allowed; box-shadow:none; }
  .btn.ghost{ background:transparent; color:var(--ink); border:1.5px solid var(--line); box-shadow:none; }
  .btn.sm{ padding:6px 12px; font-size:12.5px; }
  .btn.danger{ background:var(--danger); box-shadow:none; }
  .feat{ display:flex; flex-wrap:wrap; gap:8px 16px; }
  .feat label{ display:inline-flex; align-items:center; gap:7px; font-weight:600; color:var(--ink);
    font-size:13px; margin:0; cursor:pointer; }
  .chips{ display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
  .chip{ font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-weight:700; font-size:13px;
    background:var(--soft); border:1.5px solid var(--line); border-radius:10px; padding:7px 11px; cursor:pointer; }
  .chip:hover{ border-color:var(--accent); }
  table{ width:100%; border-collapse:collapse; font-size:13px; }
  th{ text-align:left; color:var(--muted); font-weight:700; font-size:11.5px; text-transform:uppercase;
    letter-spacing:.4px; padding:8px 10px; border-bottom:1.5px solid var(--line); }
  td{ padding:10px; border-bottom:1px solid var(--line); vertical-align:middle; }
  td.code{ font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-weight:700; }
  .tag{ display:inline-block; padding:2px 9px; border-radius:999px; font-size:11.5px; font-weight:800; }
  .tag.on{ background:rgba(16,185,129,.15); color:var(--accent-d); }
  .tag.off{ background:var(--soft); color:var(--muted); }
  .tag.exp{ background:rgba(239,68,68,.14); color:var(--danger); }
  .tag.warn{ background:rgba(245,158,11,.16); color:#b45309; }
  .muted{ color:var(--muted); }
  .empty{ text-align:center; color:var(--muted); padding:34px; }
  .tablewrap{ overflow-x:auto; }
  .acts{ display:flex; gap:6px; justify-content:flex-end; }
  .toast{ position:fixed; left:50%; bottom:26px; transform:translateX(-50%) translateY(20px);
    background:var(--ink); color:var(--card); padding:11px 18px; border-radius:12px; font-weight:700; font-size:13.5px;
    opacity:0; transition:.25s; pointer-events:none; box-shadow:var(--shadow); z-index:9; }
  .toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  .toast.err{ background:var(--danger); color:#fff; }
  .gate{ max-width:420px; margin:8vh auto 0; }
  .hide{ display:none !important; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="logo">P</div>
    <div>
      <h1>palserver GUI · 授權後台</h1>
      <div class="sub">發放 / 管理贊助者與試用識別碼</div>
    </div>
    <div class="spacer"></div>
    <button id="lock" class="btn ghost sm hide" onclick="lock()">變更 Token</button>
  </header>

  <div id="gate" class="card gate">
    <h2>管理員登入</h2>
    <p class="hint">輸入 worker 的 ADMIN_TOKEN。只存在這個分頁(sessionStorage),不會上傳。</p>
    <label>ADMIN_TOKEN</label>
    <input id="tok" type="password" placeholder="貼上 ADMIN_TOKEN" onkeydown="if(event.key==='Enter')unlock()" />
    <div class="row" style="margin-top:14px"><button class="btn" onclick="unlock()">解鎖</button></div>
  </div>

  <div id="app" class="hide">
    <!-- 發碼 -->
    <div class="card">
      <h2>🎟️ 發碼</h2>
      <p class="hint">一次可發多張。有效授權即解鎖全部早鳥功能;一碼綁一台伺服器。</p>
      <div class="grid">
        <div>
          <label>數量</label>
          <input id="count" type="number" value="1" min="1" max="500" />
        </div>
        <div>
          <label>效期</label>
          <div class="seg" id="modeSeg">
            <button type="button" class="on" data-mode="trial" onclick="setMode('trial')">試用</button>
            <button type="button" data-mode="date" onclick="setMode('date')">固定到期</button>
            <button type="button" data-mode="perm" onclick="setMode('perm')">永久</button>
          </div>
        </div>
        <div id="trialBox">
          <label>啟用後天數</label>
          <input id="trialDays" type="number" value="14" min="1" max="3650" />
        </div>
        <div id="dateBox" class="hide">
          <label>到期日</label>
          <input id="expDate" type="date" />
        </div>
        <div>
          <label>活動標籤(選填)</label>
          <input id="sponsor" type="text" placeholder="例:2026 夏季試用" />
        </div>
      </div>
      <div style="margin-top:16px">
        <label>解鎖功能(顯示用;有效授權一律全解)</label>
        <div class="feat" id="feats"></div>
      </div>
      <div class="row" style="margin-top:18px">
        <button class="btn" id="issueBtn" onclick="issue()">發碼</button>
        <span id="issueMsg" class="muted"></span>
      </div>
      <div id="result" class="hide">
        <div class="row" style="margin-top:18px">
          <strong id="resultTitle"></strong>
          <div class="spacer"></div>
          <button class="btn ghost sm" onclick="copyAll()">複製全部</button>
          <button class="btn ghost sm" onclick="downloadCsv()">下載 CSV</button>
        </div>
        <div class="chips" id="chips"></div>
      </div>
    </div>

    <!-- 管理 -->
    <div class="card">
      <h2>📋 已發識別碼</h2>
      <div class="row" style="margin-bottom:14px">
        <input id="filter" type="text" placeholder="用活動標籤過濾…" style="max-width:260px" onkeydown="if(event.key==='Enter')refresh()" />
        <button class="btn ghost sm" onclick="refresh()">重新整理</button>
        <div class="spacer"></div>
        <span id="listMeta" class="muted"></span>
      </div>
      <div class="tablewrap">
        <table>
          <thead><tr>
            <th>識別碼</th><th>標籤</th><th>效期</th><th>狀態</th><th>來源</th><th></th>
          </tr></thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
      <div id="listEmpty" class="empty hide">目前沒有符合的識別碼。</div>
    </div>
  </div>
</div>
<div id="toast" class="toast"></div>

<script>
  var FEATURES = [
    ["custom-pal","自訂帕魯"],["guild-map","公會地圖"],["pal-stats","物種數值"],
    ["bulk-items","批量道具"],["teleport","傳送玩家"]
  ];
  var mode = "trial";
  var lastCodes = [];

  function tok(){ return sessionStorage.getItem("palAdminTok") || ""; }
  function toast(msg, err){
    var t = document.getElementById("toast");
    t.textContent = msg; t.className = "toast show" + (err ? " err" : "");
    clearTimeout(t._h); t._h = setTimeout(function(){ t.className = "toast"; }, 2600);
  }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c]; }); }

  async function api(path, body){
    var res = await fetch(path, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "X-Admin-Token": tok() },
      body: JSON.stringify(body||{})
    });
    var data = await res.json().catch(function(){ return {}; });
    if(res.status===401){ toast("Token 無效", true); lock(); throw new Error("unauthorized"); }
    if(!res.ok) throw new Error(data.error || ("HTTP "+res.status));
    return data;
  }

  function unlock(){
    var v = document.getElementById("tok").value.trim();
    if(!v){ toast("請輸入 Token", true); return; }
    sessionStorage.setItem("palAdminTok", v);
    showApp();
    refresh();
  }
  function lock(){
    sessionStorage.removeItem("palAdminTok");
    document.getElementById("app").classList.add("hide");
    document.getElementById("lock").classList.add("hide");
    document.getElementById("gate").classList.remove("hide");
    document.getElementById("tok").value = "";
  }
  function showApp(){
    document.getElementById("gate").classList.add("hide");
    document.getElementById("app").classList.remove("hide");
    document.getElementById("lock").classList.remove("hide");
  }

  function setMode(m){
    mode = m;
    var segs = document.querySelectorAll("#modeSeg button");
    for(var i=0;i<segs.length;i++) segs[i].classList.toggle("on", segs[i].dataset.mode===m);
    document.getElementById("trialBox").classList.toggle("hide", m!=="trial");
    document.getElementById("dateBox").classList.toggle("hide", m!=="date");
  }

  function renderFeats(){
    var el = document.getElementById("feats"); el.innerHTML = "";
    FEATURES.forEach(function(f){
      var l = document.createElement("label");
      l.innerHTML = '<input type="checkbox" value="'+f[0]+'" checked> '+esc(f[1]);
      el.appendChild(l);
    });
  }
  function selectedFeats(){
    var out = [];
    document.querySelectorAll("#feats input:checked").forEach(function(c){ out.push(c.value); });
    return out;
  }

  async function issue(){
    var btn = document.getElementById("issueBtn");
    var body = {
      count: Number(document.getElementById("count").value)||1,
      sponsor: document.getElementById("sponsor").value.trim() || null,
      features: selectedFeats(),
      source: "campaign"
    };
    if(mode==="trial") body.trialDays = Number(document.getElementById("trialDays").value)||14;
    else if(mode==="date"){
      var d = document.getElementById("expDate").value;
      if(!d){ toast("請選到期日", true); return; }
      body.expiresAt = d + "T23:59:59Z";
    }
    btn.disabled = true; document.getElementById("issueMsg").textContent = "發碼中…";
    try{
      var r = await api("/api/license/issue", body);
      lastCodes = r.codes || [];
      var res = document.getElementById("result"); res.classList.remove("hide");
      document.getElementById("resultTitle").textContent = "已發 " + lastCodes.length + " 張(點一下複製)";
      var chips = document.getElementById("chips"); chips.innerHTML = "";
      lastCodes.forEach(function(c){
        var s = document.createElement("span"); s.className="chip"; s.textContent=c;
        s.onclick = function(){ copy(c); };
        chips.appendChild(s);
      });
      toast("已發 " + lastCodes.length + " 張");
      document.getElementById("issueMsg").textContent = "";
      refresh();
    }catch(e){ toast("發碼失敗:" + e.message, true); document.getElementById("issueMsg").textContent=""; }
    btn.disabled = false;
  }

  function copy(text){
    navigator.clipboard.writeText(text).then(function(){ toast("已複製"); },
      function(){ toast("複製失敗", true); });
  }
  function copyAll(){ if(lastCodes.length) copy(lastCodes.join("\\n")); }
  function downloadCsv(){
    if(!lastCodes.length) return;
    var csv = "code\\n" + lastCodes.join("\\n") + "\\n";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
    a.download = "palserver-codes.csv"; a.click();
  }

  function expiryText(l){
    if(l.trialDays && !l.activatedAt) return "試用 " + l.trialDays + " 天(啟用後起算)";
    if(l.expiresAt){
      var d = l.expiresAt.slice(0,10);
      if(l.activatedAt){
        var left = Math.ceil((new Date(l.expiresAt) - new Date())/86400000);
        return d + (left>0 ? "(剩 "+left+" 天)" : "");
      }
      return "至 " + d;
    }
    return "永久";
  }
  function statusTag(l){
    var now = new Date();
    if(l.expiresAt && new Date(l.expiresAt) < now) return '<span class="tag exp">已過期</span>';
    if(l.bound) return '<span class="tag on">已啟用</span>';
    return '<span class="tag off">未使用</span>';
  }

  async function refresh(){
    try{
      var r = await api("/api/license/list", { filter: document.getElementById("filter").value.trim(), limit: 1000 });
      var rows = document.getElementById("rows"); rows.innerHTML = "";
      (r.licenses||[]).forEach(function(l){
        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td class="code">'+esc(l.code)+'</td>' +
          '<td>'+(l.sponsor?esc(l.sponsor):'<span class="muted">—</span>')+'</td>' +
          '<td>'+esc(expiryText(l))+'</td>' +
          '<td>'+statusTag(l)+'</td>' +
          '<td><span class="muted">'+esc(l.source||"manual")+'</span></td>' +
          '<td><div class="acts">' +
            '<button class="btn ghost sm" onclick="copy(\\''+l.code+'\\')">複製</button>' +
            (l.bound?'<button class="btn ghost sm" onclick="doReset(\\''+l.code+'\\')">解綁</button>':'') +
            '<button class="btn danger sm" onclick="doRevoke(\\''+l.code+'\\')">撤銷</button>' +
          '</div></td>';
        rows.appendChild(tr);
      });
      var n = (r.licenses||[]).length;
      document.getElementById("listMeta").textContent = "共 " + n + " 張";
      document.getElementById("listEmpty").classList.toggle("hide", n>0);
    }catch(e){ if(e.message!=="unauthorized") toast("讀取失敗:"+e.message, true); }
  }

  async function doReset(code){
    if(!confirm("解除 " + code + " 的機器綁定?贊助者可換到別台啟用。")) return;
    try{ await api("/api/license/reset", {code:code}); toast("已解綁"); refresh(); }
    catch(e){ toast("失敗:"+e.message, true); }
  }
  async function doRevoke(code){
    if(!confirm("撤銷(刪除)" + code + "?啟用中的機器下次重驗會失效,無法復原。")) return;
    try{ await api("/api/license/delete", {code:code}); toast("已撤銷"); refresh(); }
    catch(e){ toast("失敗:"+e.message, true); }
  }

  renderFeats();
  if(tok()){ showApp(); refresh(); }
</script>
</body>
</html>`;
