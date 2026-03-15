import { Elysia } from "elysia";
import { html } from "@elysiajs/html";

const TARGET_UID = 512087790;
const TARGET_FANS = 1_000_000;

const app = new Elysia()
  .use(html())
  .get("/api/fans", async () => {
    const res = await fetch(
      `https://api.bilibili.com/x/relation/stat?vmid=${TARGET_UID}`
    );
    const json = await res.json();
    const follower = json?.data?.follower ?? 0;
    return {
      follower,
      target: TARGET_FANS,
      diff: TARGET_FANS - follower,
    };
  })
  .get(
    "/",
    () => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B站粉丝追踪器</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .card {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      min-width: 420px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.18);
    }
    h1 { font-size: 24px; margin-bottom: 8px; font-weight: 600; }
    .uid { font-size: 14px; opacity: 0.7; margin-bottom: 32px; }
    .fans-count {
      font-size: 64px;
      font-weight: 800;
      margin: 16px 0;
      font-variant-numeric: tabular-nums;
      transition: transform 0.3s;
    }
    .fans-count.updated { transform: scale(1.05); }
    .label {
      font-size: 14px; opacity: 0.8;
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;
    }
    .diff-section {
      margin-top: 32px; padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    .diff-value {
      font-size: 36px; font-weight: 700;
      color: #ffd700; font-variant-numeric: tabular-nums;
    }
    .progress-bar {
      width: 100%; height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px; margin-top: 20px; overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffd700, #ff6b6b);
      border-radius: 4px; transition: width 0.5s ease;
    }
    .progress-text { margin-top: 8px; font-size: 14px; opacity: 0.8; }
    .status { margin-top: 24px; font-size: 12px; opacity: 0.5; }
    .dot {
      display: inline-block; width: 6px; height: 6px;
      border-radius: 50%; background: #4caf50;
      margin-right: 6px; animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  </style>
</head>
<body>
  <div class="card">
    <h1>B站粉丝追踪器</h1>
    <div class="uid">UID: ${TARGET_UID}</div>
    <div class="label">当前粉丝数</div>
    <div class="fans-count" id="fans">--</div>
    <div class="diff-section">
      <div class="label">距离 100w 粉丝还差</div>
      <div class="diff-value" id="diff">--</div>
      <div class="progress-bar">
        <div class="progress-fill" id="progress" style="width:0%"></div>
      </div>
      <div class="progress-text" id="progress-text">-- %</div>
    </div>
    <div class="status" id="status">
      <span class="dot"></span>正在连接...
    </div>
  </div>
  <script>
    const fansEl = document.getElementById('fans');
    const diffEl = document.getElementById('diff');
    const progressEl = document.getElementById('progress');
    const progressTextEl = document.getElementById('progress-text');
    const statusEl = document.getElementById('status');

    function fmt(n) { return n.toLocaleString('zh-CN'); }

    async function fetchFans() {
      try {
        const res = await fetch('/api/fans');
        const data = await res.json();
        fansEl.textContent = fmt(data.follower);
        fansEl.classList.add('updated');
        setTimeout(() => fansEl.classList.remove('updated'), 300);
        diffEl.textContent = data.diff > 0 ? fmt(data.diff) : '已达成!';
        if (data.diff <= 0) diffEl.style.color = '#4caf50';
        const pct = Math.min((data.follower / data.target) * 100, 100);
        progressEl.style.width = pct + '%';
        progressTextEl.textContent = pct.toFixed(4) + '%';
        statusEl.innerHTML = '<span class="dot"></span>上次更新: '
          + new Date().toLocaleTimeString('zh-CN') + ' (每5秒刷新)';
      } catch {
        statusEl.innerHTML = '<span class="dot" style="background:#ff6b6b"></span>请求失败，5秒后重试...';
      }
    }
    fetchFans();
    setInterval(fetchFans, 5000);
  </script>
</body>
</html>`
  )
  .listen(3000);

console.log(
  `🚀 粉丝追踪器运行中: http://localhost:${app.server?.port}`
);
