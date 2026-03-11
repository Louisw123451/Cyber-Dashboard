# 🛡️ Cybersecurity Live Dashboard

A professional, single-page cybersecurity monitoring dashboard built for a portfolio.  
Fully static — runs on **Cloudflare Pages** with zero backend required.

---

## 📁 Folder Structure

```
cyber-dashboard/
├── index.html          # Single-page dashboard shell
├── style.css           # All styling (dark theme, grid, animations)
├── script.js           # Dynamic rendering, simulated API calls, Chart.js
├── data/
│   └── threats.json    # Dummy CVE/threat feed (swap for real NVD data)
└── README.md           # This file
```

---

## 📄 File Descriptions

| File | Purpose |
|------|---------|
| `index.html` | Semantic HTML skeleton. Defines the six dashboard sections as `<section>` elements that JavaScript populates dynamically. Chart.js is loaded via CDN. |
| `style.css` | Full dark-theme CSS. Uses CSS custom properties for theming, CSS Grid for the responsive layout, and keyframe animations for the pulse dot, skeleton loaders, and typing cursor. |
| `script.js` | Renders every panel from dummy data, animates counters, runs the typewriter effect, and draws the Chart.js stacked bar chart. Each render function is isolated so you can swap in real API calls with minimal changes. The `escapeHtml()` utility prevents XSS when inserting external data into the DOM. |
| `data/threats.json` | Structured dummy CVE feed in the same shape as the NVD API. Import directly or serve via a Cloudflare Worker proxy. |

---

## 🚀 Deploy on Cloudflare Pages

### Option A — Drag & Drop (fastest)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**.
2. Choose **Upload assets** (direct upload).
3. Drag the entire `cyber-dashboard/` folder in.
4. Hit **Deploy site** — you'll get a `*.pages.dev` URL instantly.

### Option B — Git Integration (recommended)

1. Push this folder to a GitHub / GitLab repository.
2. In Cloudflare Pages, click **Connect to Git** and select your repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` (root of the repo)
4. Click **Save and Deploy**.

Every `git push` to `main` will trigger a new deployment automatically.

### Custom Domain

In your Pages project → **Custom Domains** → add `dashboard.yourdomain.com`.  
Cloudflare handles the SSL certificate automatically.

---

## ⚡ Cloudflare Worker Integration (Optional)

To replace dummy data with live responses, create a Worker at  
`your-worker.workers.dev` with routes such as:

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/api/threats` | Proxy NVD API and return top CVEs |
| `GET`  | `/api/uptime`  | Ping target URLs and return status |
| `POST` | `/api/summarize` | Call OpenAI API server-side and return AI summary |

Store secrets (OpenAI key, etc.) as **Workers Environment Variables** — never in client-side code.

In `script.js`, replace any `simulateFetch()` call with:

```js
const data = await fetch("https://your-worker.workers.dev/api/threats")
  .then(r => r.json());
```

---

## 🔐 Skills Demonstrated

| Category | Skills |
|----------|--------|
| **Frontend** | Semantic HTML5, CSS Grid/Flexbox, CSS custom properties, responsive design, keyframe animations |
| **JavaScript** | DOM manipulation, async/await, simulated API fetching, XSS prevention with `escapeHtml()`, Chart.js integration |
| **Cybersecurity** | CVE/CVSS concepts, SSL lifecycle, HTTP security headers (CSP, HSTS, X-Frame-Options), threat severity triage |
| **Cloud / DevOps** | Cloudflare Pages static deployment, Cloudflare Workers API proxy pattern, environment variable security |
| **UX / Design** | Dark cybersecurity aesthetic, skeleton loaders, live pulse indicators, animated counters, typewriter effect |

---

## 🔮 Future Enhancements

- [ ] Real uptime pings via a Cloudflare Worker (cron trigger every 5 min)
- [ ] Live CVE feed from the [NVD API](https://nvd.nist.gov/developers/vulnerabilities)
- [ ] OpenAI-generated threat summary via Cloudflare Worker
- [ ] Cloudflare D1 database for storing historical uptime/threat data
- [ ] ApexCharts for more advanced trend visualisations
- [ ] Dark/light theme toggle
- [ ] Export dashboard as PDF report

---

*Built with HTML · CSS · JavaScript · Cloudflare Pages*
