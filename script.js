/**
 * Cybersecurity Live Dashboard — script.js
 * ─────────────────────────────────────────
 * Renders all dashboard panels using simulated data.
 * Each section is clearly separated so you can swap in
 * real API/Cloudflare Worker calls with minimal changes.
 *
 * To integrate a real backend, search for "// REAL API:"
 * comments and replace the simulateFetch() calls.
 */

"use strict";

/* ============================================================
   DUMMY DATA
   (Replace these with real API responses in production)
============================================================ */

/** Website uptime data */
const UPTIME_DATA = [
  { url: "example-corp.com",     status: "online",  latency: 42  },
  { url: "testbank-portal.io",   status: "online",  latency: 138 },
  { url: "legacy-server.net",    status: "offline", latency: null },
];

/** SSL certificate data */
const SSL_DATA = [
  { domain: "example-corp.com",   status: "valid",   expiry: "2026-11-15", daysLeft: 250 },
  { domain: "testbank-portal.io", status: "warning", expiry: "2026-04-01", daysLeft: 22  },
  { domain: "legacy-server.net",  status: "expired", expiry: "2025-12-01", daysLeft: -99 },
];

/** HTTP security headers data */
const HEADERS_DATA = [
  { name: "Content-Security-Policy",   status: "present" },
  { name: "X-Frame-Options",           status: "present" },
  { name: "X-Content-Type-Options",    status: "present" },
  { name: "Strict-Transport-Security", status: "present" },
  { name: "Referrer-Policy",           status: "missing" },
  { name: "Permissions-Policy",        status: "missing" },
  { name: "X-XSS-Protection",          status: "partial" },
];

/** CVE / threat feed data */
const THREAT_DATA = [
  {
    id:          "CVE-2026-1337",
    title:       "Critical RCE in OpenSSH",
    severity:    "high",
    description: "Unauthenticated remote code execution via crafted SSH packets. Grants root-level access.",
    date:        "2026-03-09",
    cvss:        9.8,
  },
  {
    id:          "CVE-2026-4488",
    title:       "SQL Injection in Popular CMS",
    severity:    "high",
    description: "Unauthenticated SQL injection on the login endpoint exposes the full database.",
    date:        "2026-03-08",
    cvss:        9.1,
  },
  {
    id:          "CVE-2026-2201",
    title:       "Reflected XSS in jQuery UI",
    severity:    "medium",
    description: "Reflected XSS via unsanitised search parameter allows session hijacking.",
    date:        "2026-03-07",
    cvss:        6.1,
  },
  {
    id:          "CVE-2026-0891",
    title:       "TLS 1.0 Downgrade Attack",
    severity:    "low",
    description: "Legacy TLS 1.0 support enables protocol downgrade. Upgrade to TLS 1.3 is recommended.",
    date:        "2026-03-06",
    cvss:        3.7,
  },
];

/** AI-generated summary text (placeholder — swap for OpenAI API response) */
const AI_SUMMARY_TEXT =
  "Current threat posture indicates 2 high-severity vulnerabilities requiring immediate patching. " +
  "The OpenSSH RCE (CVE-2026-1337) poses the greatest risk and should be remediated within 24 hours. " +
  "SSL certificate for testbank-portal.io expires in 22 days — renewal action is required. " +
  "HTTP security headers are 57% compliant; implementing Referrer-Policy and Permissions-Policy will " +
  "significantly improve the security posture. No active intrusion indicators detected in the last 24 hours.";

/** Chart data: last 7 days */
const CHART_LABELS       = ["Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10"];
const CHART_DATA_HIGH    = [1, 0, 2, 1, 3, 2, 2];
const CHART_DATA_MEDIUM  = [2, 3, 1, 2, 1, 3, 1];
const CHART_DATA_LOW     = [1, 1, 0, 1, 2, 0, 1];

/** System metrics — isPercent controls whether a progress bar is shown */
const METRICS_DATA = [
  { label: "CPU Usage",             value: 67,   unit: "%",  color: "#f59e0b", icon: "🖥️", isPercent: true  },
  { label: "Memory Usage",          value: 43,   unit: "%",  color: "#00d4ff", icon: "💾", isPercent: true  },
  { label: "Network I/O",           value: 78,   unit: "%",  color: "#a855f7", icon: "📡", isPercent: true  },
  { label: "Firewall Rules Active", value: 94,   unit: "%",  color: "#10b981", icon: "🔥", isPercent: true  },
  { label: "Threats Blocked Today", value: 349,  unit: "",   color: "#ef4444", icon: "🚫", isPercent: false },
  { label: "Active Connections",    value: 1247, unit: "",   color: "#00d4ff", icon: "🔗", isPercent: false },
];

/** Periodic slide-in alert notifications */
const TOAST_MESSAGES = [
  { type: "danger",  icon: "🔴", text: "CVE-2026-5001: Critical RCE in Apache HTTP Server" },
  { type: "warning", icon: "⚠️", text: "SSL certificate for api.legacy-server.net expires in 18 days" },
  { type: "success", icon: "✅", text: "Intrusion attempt from 194.26.135.22 — blocked by firewall" },
  { type: "danger",  icon: "🔴", text: "Brute-force attack on SSH port 22 — 847 attempts in 10 min" },
  { type: "warning", icon: "⚠️", text: "Permissions-Policy header missing on 2 monitored endpoints" },
  { type: "success", icon: "✅", text: "Automated security scan completed — 0 new vulnerabilities" },
  { type: "danger",  icon: "🔴", text: "Suspicious outbound traffic flagged from 192.168.1.104" },
];

/** Attack map origin nodes (canvas-normalised 0–1 coordinates) */
const ATTACK_ORIGINS = [
  { x: 0.63, y: 0.22, label: "Moscow, RU",    color: "#ef4444" },
  { x: 0.79, y: 0.36, label: "Beijing, CN",   color: "#ef4444" },
  { x: 0.62, y: 0.39, label: "Tehran, IR",    color: "#ef4444" },
  { x: 0.52, y: 0.56, label: "Lagos, NG",     color: "#f59e0b" },
  { x: 0.27, y: 0.65, label: "São Paulo, BR", color: "#f59e0b" },
  { x: 0.18, y: 0.30, label: "New York, US",  color: "#10b981" },
  { x: 0.71, y: 0.47, label: "Mumbai, IN",    color: "#f59e0b" },
  { x: 0.48, y: 0.18, label: "Stockholm, SE", color: "#10b981" },
];

/** Attack map central protected server */
const ATTACK_TARGET = { x: 0.50, y: 0.42 };

/* ============================================================
   RENDER FUNCTIONS
============================================================ */

/**
 * Renders the Website Uptime Monitor panel.
 */
function renderUptime() {
  const container = document.getElementById("uptime-list");
  container.innerHTML = "";

  // Simulated uptime percentages (fixed so they don't flicker on refresh)
  const UPTIME_PCTS = ["99.97", "99.61", "0.00"];

  const onlineCount = UPTIME_DATA.filter(s => s.status === "online").length;
  const summaryClass = onlineCount === UPTIME_DATA.length ? "good" : onlineCount > 0 ? "warn" : "bad";

  const summaryRow = document.createElement("div");
  summaryRow.className = "panel-summary-row";
  summaryRow.innerHTML = `
    <span class="panel-summary-label">Monitoring ${UPTIME_DATA.length} endpoints</span>
    <span class="panel-summary-score ${summaryClass}">${onlineCount}/${UPTIME_DATA.length} Online</span>
  `;
  container.appendChild(summaryRow);

  UPTIME_DATA.forEach((site, idx) => {
    const isOnline = site.status === "online";
    const latencyPct = site.latency ? Math.min(100, (site.latency / 400) * 100) : 0;
    const latencyColor = !site.latency
      ? "#ef4444"
      : site.latency < 100 ? "#10b981"
      : site.latency < 250 ? "#f59e0b"
      : "#ef4444";

    const item = document.createElement("div");
    item.className = "uptime-item";
    item.innerHTML = `
      <div class="uptime-row-top">
        <span class="uptime-dot ${site.status}"></span>
        <span class="uptime-url">${escapeHtml(site.url)}</span>
        <span class="uptime-pct ${site.status}">${UPTIME_PCTS[idx]}%</span>
      </div>
      ${
        isOnline
          ? `<div class="uptime-row-meta">
               <span class="uptime-latency-label">Latency: <strong style="color:${latencyColor}">${site.latency} ms</strong></span>
               <div class="uptime-latency-track">
                 <div class="uptime-latency-fill" style="width:${latencyPct}%;background:${latencyColor}"></div>
               </div>
             </div>`
          : `<div class="uptime-row-meta uptime-offline-msg">Endpoint unreachable — check connection</div>`
      }
    `;
    container.appendChild(item);
  });
}

/**
 * Renders the SSL Certificate Status panel.
 */
function renderSSL() {
  const container = document.getElementById("ssl-list");
  container.innerHTML = "";

  const CERT_MAX_DAYS = 365;

  SSL_DATA.forEach(cert => {
    const pct = cert.daysLeft > 0
      ? Math.round(Math.min(100, (cert.daysLeft / CERT_MAX_DAYS) * 100))
      : 0;
    const barColor =
      cert.status === "valid"   ? "#10b981" :
      cert.status === "warning" ? "#f59e0b" : "#ef4444";
    const grade =
      cert.status === "valid"   ? "A" :
      cert.status === "warning" ? "B" : "F";

    const daysText = cert.daysLeft > 0
      ? `Expires in <strong>${cert.daysLeft}</strong> days`
      : `Expired <strong>${Math.abs(cert.daysLeft)}</strong> days ago`;

    const item = document.createElement("div");
    item.className = `ssl-item ${cert.status}`;
    item.innerHTML = `
      <div class="ssl-row-top">
        <span class="ssl-domain">${escapeHtml(cert.domain)}</span>
        <span class="ssl-grade grade-${cert.status}">${grade}</span>
      </div>
      <div class="ssl-expiry-text">${daysText} &nbsp;·&nbsp; ${escapeHtml(cert.expiry)}</div>
      <div class="ssl-progress-track">
        <div class="ssl-progress-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="ssl-progress-legend">
        <span>Issued</span>
        <span>${pct}% remaining</span>
        <span>Expiry</span>
      </div>
    `;

    container.appendChild(item);
  });
}

/**
 * Renders the HTTP Security Headers panel.
 */
function renderHeaders() {
  const container = document.getElementById("headers-list");
  container.innerHTML = "";

  const presentCount = HEADERS_DATA.filter(h => h.status === "present").length;
  const total = HEADERS_DATA.length;
  const pct = Math.round((presentCount / total) * 100);
  const scoreColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  // Compliance score bar
  const scoreRow = document.createElement("div");
  scoreRow.className = "headers-score-row";
  scoreRow.innerHTML = `
    <div class="headers-score-text">
      <span>Security Compliance</span>
      <span style="color:${scoreColor};font-weight:700">${pct}% &nbsp;(${presentCount}/${total} headers)</span>
    </div>
    <div class="headers-score-track">
      <div class="headers-score-fill" style="width:${pct}%;background:${scoreColor}"></div>
    </div>
  `;
  container.appendChild(scoreRow);

  const LABEL_MAP = { present: "Present", partial: "Partial", missing: "Missing" };
  const RISK_MAP = {
    "Content-Security-Policy":   "Injection / XSS",
    "X-Frame-Options":           "Clickjacking",
    "X-Content-Type-Options":    "MIME sniffing",
    "Strict-Transport-Security": "HTTPS bypass",
    "Referrer-Policy":           "Info leakage",
    "Permissions-Policy":        "Feature abuse",
    "X-XSS-Protection":          "XSS risk",
  };

  HEADERS_DATA.forEach(header => {
    const item = document.createElement("div");
    item.className = "header-item";
    item.innerHTML = `
      <div class="header-name-group">
        <span class="header-name">${escapeHtml(header.name)}</span>
        ${RISK_MAP[header.name] ? `<span class="header-risk">${RISK_MAP[header.name]}</span>` : ""}
      </div>
      <span class="header-badge ${header.status}">${LABEL_MAP[header.status]}</span>
    `;
    container.appendChild(item);
  });
}

/**
 * Simulates a network fetch, shows skeleton loaders,
 * then renders the Threat Feed panel.
 *
 * REAL API: replace simulateFetch() with:
 *   const data = await fetch("https://your-worker.workers.dev/api/threats").then(r => r.json());
 */
async function renderThreats() {
  const container = document.getElementById("threat-list");

  // Skeleton loaders while "fetching"
  container.innerHTML = Array(3).fill('<div class="skeleton"></div>').join("");

  // Simulate API latency (remove this line and use real fetch above)
  await simulateFetch(THREAT_DATA, 950);

  container.innerHTML = "";

  // Display top 3 threats
  THREAT_DATA.slice(0, 3).forEach(threat => {
    const item = document.createElement("div");
    item.className = `threat-item ${threat.severity}`;

    const cvssColor =
      threat.cvss >= 9.0 ? "#ef4444" :
      threat.cvss >= 7.0 ? "#f59e0b" :
      threat.cvss >= 4.0 ? "#a855f7" : "#10b981";
    const cvssBarWidth = (threat.cvss / 10) * 100;

    item.innerHTML = `
      <div class="threat-top">
        <span class="threat-cve">${escapeHtml(threat.id)}</span>
        <span class="severity-badge ${threat.severity}">${capitalise(threat.severity)}</span>
      </div>
      <div class="threat-title">${escapeHtml(threat.title)}</div>
      <div class="threat-desc">${escapeHtml(threat.description)}</div>
      <div class="threat-footer">
        <div class="cvss-row">
          <span class="cvss-label">CVSS</span>
          <div class="cvss-bar-track">
            <div class="cvss-bar-fill" style="width:${cvssBarWidth}%;background:${cvssColor}"></div>
          </div>
          <span class="cvss-score" style="color:${cvssColor}">${threat.cvss}</span>
        </div>
        <span class="threat-date">🕒 ${escapeHtml(threat.date)}</span>
      </div>
    `;

    container.appendChild(item);
  });
}

/**
 * Renders the AI Security Summary panel with animated counters
 * and a typewriter effect for the summary text.
 *
 * REAL API: fetch the AI summary string from:
 *   POST https://your-worker.workers.dev/api/summarize
 */
function renderAISummary() {
  const container = document.getElementById("ai-summary");

  // Calculate stat values from the data
  const highCount    = THREAT_DATA.filter(t => t.severity === "high").length;
  const presentCount = HEADERS_DATA.filter(h => h.status === "present").length;
  const sslIssues    = SSL_DATA.filter(s => s.status !== "valid").length;

  container.innerHTML = `
    <div class="ai-stat">
      <span class="ai-stat-value" id="stat-threats">0</span>
      <span class="ai-stat-label">High Severity Threats</span>
    </div>
    <div class="ai-stat">
      <span class="ai-stat-value" id="stat-headers">0</span>
      <span class="ai-stat-label">Headers Passing</span>
    </div>
    <div class="ai-stat">
      <span class="ai-stat-value" id="stat-ssl">0</span>
      <span class="ai-stat-label">SSL Issues Detected</span>
    </div>
    <div class="ai-text-block">
      <span class="ai-text-label">🤖 AI Analysis</span>
      <span id="ai-typed"></span><span class="typing-cursor"></span>
    </div>
    <div class="cf-notice">
      🔧 <strong>Cloudflare Worker Placeholder:</strong>
      Replace the dummy summary with a live AI call via
      <code>POST https://your-worker.workers.dev/api/summarize</code>.
      The Worker can call the OpenAI API server-side using your API key stored as an
      <code>AI_API_KEY</code> environment variable — keeping it out of client-side code.
      See <code>README.md</code> for full setup instructions.
    </div>
  `;

  // Animate the three counter stats
  animateCounter("stat-threats", highCount);
  animateCounter("stat-headers", presentCount);
  animateCounter("stat-ssl",     sslIssues);

  // Typewriter effect for the AI text
  typewriterEffect("ai-typed", AI_SUMMARY_TEXT, 18);
}

/**
 * Renders the Chart.js stacked bar chart for threat statistics.
 */
function renderChart() {
  const canvas = document.getElementById("threatChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: CHART_LABELS,
      datasets: [
        {
          label: "High",
          data:            CHART_DATA_HIGH,
          backgroundColor: "rgba(239, 68, 68, 0.75)",
          borderColor:     "rgba(239, 68, 68, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Medium",
          data:            CHART_DATA_MEDIUM,
          backgroundColor: "rgba(245, 158, 11, 0.75)",
          borderColor:     "rgba(245, 158, 11, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Low",
          data:            CHART_DATA_LOW,
          backgroundColor: "rgba(16, 185, 129, 0.75)",
          borderColor:     "rgba(16, 185, 129, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#94a3b8",
            font: { size: 11 },
            boxWidth: 12,
          },
        },
        tooltip: {
          backgroundColor: "rgba(13, 13, 32, 0.95)",
          titleColor:      "#00d4ff",
          bodyColor:       "#e2e8f0",
          borderColor:     "rgba(0, 212, 255, 0.3)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "#475569", font: { size: 10 } },
          grid:  { color: "rgba(255,255,255,0.04)" },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { color: "#475569", font: { size: 10 }, stepSize: 1 },
          grid:  { color: "rgba(255,255,255,0.04)" },
        },
      },
    },
  });
}

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

/**
 * Returns a Promise that resolves after a delay, simulating a network request.
 * In production, replace callers with a real fetch() call.
 *
 * @param {*}      dummyData  Data to resolve with
 * @param {number} delay      Simulated latency in ms
 * @returns {Promise<*>}
 */
function simulateFetch(dummyData, delay = 800) {
  return new Promise(resolve => setTimeout(() => resolve(dummyData), delay));
}

/**
 * Animates a numeric counter element from 0 to a target value.
 *
 * @param {string} elementId  ID of the target DOM element
 * @param {number} target     The final number to display
 * @param {string} suffix     Optional string appended to each displayed value (e.g. "%")
 */
function animateCounter(elementId, target, suffix = "") {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const steps    = 24;
  const stepVal  = Math.max(1, Math.ceil(target / steps));
  const interval = setInterval(() => {
    current = Math.min(current + stepVal, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(interval);
  }, 55);
}

/**
 * Types text into a DOM element one character at a time.
 *
 * @param {string} elementId  ID of the target span element
 * @param {string} text       Text to animate
 * @param {number} speed      Milliseconds per character
 */
function typewriterEffect(elementId, text, speed = 22) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param {string} str  Raw input string
 * @returns {string}    HTML-escaped string
 */
function escapeHtml(str) {
  const MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(str).replace(/[&<>"']/g, ch => MAP[ch]);
}

/**
 * Capitalises the first character of a string.
 *
 * @param {string} str
 * @returns {string}
 */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Updates the "Last updated" timestamp shown in the header.
 */
function updateTimestamp() {
  const el = document.getElementById("last-updated");
  if (el) el.textContent = "Last updated: " + new Date().toLocaleTimeString();
}

/**
 * Re-fetches uptime data and re-renders the uptime panel.
 * Called by the Refresh button.
 *
 * REAL API: replace simulateFetch() with a real ping endpoint on a Cloudflare Worker.
 */
async function refreshUptime() {
  const container = document.getElementById("uptime-list");
  container.innerHTML = Array(3).fill('<div class="skeleton"></div>').join("");

  await simulateFetch(UPTIME_DATA, 750);
  renderUptime();
  updateTimestamp();
}

/* ============================================================
   MATRIX RAIN BACKGROUND
============================================================ */

/**
 * Animates the iconic digital rain effect on a fixed background canvas.
 * Opacity is kept low so it doesn’t distract from the dashboard content.
 */
function initMatrixRain() {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;

  const ctx     = canvas.getContext("2d");
  const CHARS   = "01アイウエオカキクケコ∂∫≈∑ABCDEF#!@$&";
  const FSIZE   = 11;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let drops = [];
  function resetDrops() {
    const cols = Math.floor(canvas.width / FSIZE);
    drops = Array.from({ length: cols }, () => Math.random() * -40);
  }
  resetDrops();
  window.addEventListener("resize", resetDrops);

  setInterval(() => {
    ctx.fillStyle = "rgba(5, 5, 15, 0.06)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FSIZE + "px monospace";

    drops.forEach((y, x) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillStyle = "rgba(0, 212, 255, 0.5)";
      ctx.fillText(char, x * FSIZE, y * FSIZE);
      if (y * FSIZE > canvas.height && Math.random() > 0.975) drops[x] = 0;
      drops[x] += 0.5;
    });
  }, 50);
}

/* ============================================================
   SYSTEM METRICS PANEL
============================================================ */

/**
 * Renders the System Metrics panel with animated bars and live fluctuation.
 */
function renderSystemMetrics() {
  const container = document.getElementById("metrics-list");
  if (!container) return;

  container.innerHTML = "";

  METRICS_DATA.forEach((metric, i) => {
    const item = document.createElement("div");
    item.className = "metric-item";

    if (metric.isPercent) {
      item.innerHTML = `
        <div class="metric-header">
          <span class="metric-icon">${metric.icon}</span>
          <span class="metric-label">${escapeHtml(metric.label)}</span>
          <span class="metric-value" id="metric-val-${i}" style="color:${metric.color}">0%</span>
        </div>
        <div class="metric-bar-track">
          <div class="metric-bar-fill" id="metric-bar-${i}"
               style="background:${metric.color};width:0%"></div>
        </div>
      `;
    } else {
      item.innerHTML = `
        <div class="metric-header">
          <span class="metric-icon">${metric.icon}</span>
          <span class="metric-label">${escapeHtml(metric.label)}</span>
          <span class="metric-value" id="metric-val-${i}" style="color:${metric.color}">0</span>
        </div>
      `;
    }

    container.appendChild(item);

    // Stagger each row’s entrance
    setTimeout(() => {
      const barEl = document.getElementById(`metric-bar-${i}`);
      if (barEl) barEl.style.width = metric.value + "%";
      animateCounter(`metric-val-${i}`, metric.value, metric.unit);
    }, i * 130);
  });

  // Simulate live fluctuation every 3 seconds for % metrics
  setInterval(() => {
    METRICS_DATA.forEach((metric, i) => {
      if (!metric.isPercent) return;
      const newVal    = Math.min(98, Math.max(4, metric.value + (Math.random() - 0.5) * 8));
      metric.value    = Math.round(newVal);
      const barEl     = document.getElementById(`metric-bar-${i}`);
      const valEl     = document.getElementById(`metric-val-${i}`);
      if (barEl) barEl.style.width    = metric.value + "%";
      if (valEl) valEl.textContent    = metric.value + "%";
    });
  }, 3000);
}

/**
 * Starts the live digital clock shown in the System Metrics card header.
 */
function startMetricsClock() {
  function tick() {
    const el = document.getElementById("metrics-clock");
    if (el) el.textContent = new Date().toLocaleTimeString();
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   LIVE ATTACK MAP
============================================================ */

/**
 * Draws an animated attack-origin map on a canvas.
 * Each node fires a travelling "packet" dot along a bezier arc to the
 * central protected server. Uses requestAnimationFrame for smooth 60 fps.
 */
function initAttackMap() {
  const canvas = document.getElementById("attackCanvas");
  if (!canvas) return;

  const parent   = canvas.parentElement;
  canvas.width   = Math.max(parent ? parent.clientWidth : 600, 300);
  canvas.height  = 220;

  const ctx = canvas.getContext("2d");
  let frame = 0;

  function draw() {
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#070714";
    ctx.fillRect(0, 0, W, H);

    // Subtle dot grid
    ctx.fillStyle = "rgba(0, 212, 255, 0.05)";
    for (let gx = 0; gx <= W; gx += 22) {
      for (let gy = 0; gy <= H; gy += 22) {
        ctx.beginPath();
        ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tx = ATTACK_TARGET.x * W;
    const ty = ATTACK_TARGET.y * H;

    // Target — pulsing outer ring
    const pulse = Math.sin(frame * 0.055) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 18 + pulse * 5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 + pulse * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Target — inner ring
    ctx.beginPath();
    ctx.arc(tx, ty, 9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 212, 255, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Target — core dot
    ctx.beginPath();
    ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#00d4ff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#00d4ff";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🎯 PROTECTED", tx, ty + 26);

    // Arcs, traveling packets, and origin dots
    ATTACK_ORIGINS.forEach((origin, i) => {
      const ox  = origin.x * W;
      const oy  = origin.y * H;
      const cpx = (ox + tx) / 2;
      const cpy = Math.min(oy, ty) - 35 - Math.abs(ox - tx) * 0.08;

      const rgb = origin.color === "#ef4444" ? "239,68,68"
                : origin.color === "#f59e0b" ? "245,158,11"
                : "16,185,129";

      // Arc trail
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.quadraticCurveTo(cpx, cpy, tx, ty);
      ctx.strokeStyle = `rgba(${rgb}, 0.22)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Traveling packet dot
      const t  = ((frame * (0.007 + i * 0.0015)) + i / ATTACK_ORIGINS.length) % 1;
      const bx = (1 - t) * (1 - t) * ox + 2 * (1 - t) * t * cpx + t * t * tx;
      const by = (1 - t) * (1 - t) * oy + 2 * (1 - t) * t * cpy + t * t * ty;

      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fillStyle    = origin.color;
      ctx.shadowBlur   = 10;
      ctx.shadowColor  = origin.color;
      ctx.fill();
      ctx.shadowBlur   = 0;

      // Origin dot with pulse ring
      const op = Math.sin(frame * 0.07 + i * 1.4) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(ox, oy, 5 + op * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, 0.1)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ox, oy, 3, 0, Math.PI * 2);
      ctx.fillStyle   = origin.color;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = origin.color;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Origin label
      const isLeft = ox < W * 0.5;
      ctx.fillStyle  = "#475569";
      ctx.font       = "8px monospace";
      ctx.textAlign  = isLeft ? "right" : "left";
      ctx.fillText(origin.label, isLeft ? ox - 8 : ox + 8, oy - 8);
    });

    frame++;
    requestAnimationFrame(draw);
  }

  draw();
}

/* ============================================================
   TOAST NOTIFICATIONS
============================================================ */

/** Cycles through TOAST_MESSAGES in order */
let toastIndex = 0;

/**
 * Displays a slide-in toast that auto-dismisses after 5 seconds.
 *
 * @param {{ type: string, icon: string, text: string }} toast
 */
function showToast(toast) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const el = document.createElement("div");
  el.className = `toast toast-${toast.type}`;
  el.innerHTML = `
    <span class="toast-icon">${toast.icon}</span>
    <span class="toast-text">${escapeHtml(toast.text)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Dismiss">×</button>
  `;

  container.appendChild(el);

  // Double rAF ensures CSS transition fires
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("toast-show")));

  setTimeout(() => {
    el.classList.remove("toast-show");
    el.classList.add("toast-hide");
    setTimeout(() => el.remove(), 420);
  }, 5000);
}

/**
 * Fires the first toast after 3 s, then every 8 s.
 */
function startNotifications() {
  const fire = () => {
    showToast(TOAST_MESSAGES[toastIndex % TOAST_MESSAGES.length]);
    toastIndex++;
  };
  setTimeout(() => { fire(); setInterval(fire, 8000); }, 3000);
}

/**
 * Updates the threat count badge in the sticky header.
 */
function updateThreatCounter() {
  const el = document.getElementById("threat-counter");
  if (!el) return;
  const total = THREAT_DATA.length;
  const high  = THREAT_DATA.filter(t => t.severity === "high").length;
  el.textContent = `⚡ ${total} threats · ${high} critical`;
}

/* ============================================================
   INITIALISATION
============================================================ */

/**
 * Main entry point — renders every dashboard panel in order.
 * Async because the Threat Feed uses a simulated async fetch.
 */
async function init() {
  initThemeToggle();
  updateTimestamp();
  updateThreatCounter();
  startMetricsClock();
  renderUptime();
  renderSSL();
  renderHeaders();
  await renderThreats();  // waits for simulated fetch before continuing
  renderAISummary();
  renderChart();
  renderSystemMetrics();
  initAttackMap();
  startNotifications();
  initMatrixRain();
}

/* ============================================================
   DARK / LIGHT THEME TOGGLE
   Persistent theme inspired by worldmonitor.app dark/light toggle
   Reference: github.com/koala73/worldmonitor
============================================================ */

/**
 * Applies the saved theme preference on load.
 */
function initThemeToggle() {
  const saved = localStorage.getItem("cyber-theme");
  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    const icon = document.getElementById("theme-icon");
    if (icon) icon.textContent = "🌙";
  }
}

/**
 * Toggles between dark and light themes, persisting the preference.
 */
function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  document.documentElement.setAttribute("data-theme", isLight ? "dark" : "light");
  localStorage.setItem("cyber-theme", isLight ? "dark" : "light");
  const icon = document.getElementById("theme-icon");
  if (icon) icon.textContent = isLight ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", init);
