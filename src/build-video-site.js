// Build VideoWisdom static site — md → html organized by speaker → category
// Mitigations: transcripts ignored (.gitignore), lean md only (8KB), LFS for media, incremental build
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content/videos");
const outDir = path.join(__dirname, "../dist");
const outVideosDir = path.join(outDir, "videos");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    meta[k] = v;
  }
  return { meta, body: m[2] };
}

function extractMeta(raw, fileName) {
  const { meta, body } = parseFrontmatter(raw);
  // Prefer frontmatter, fallback to parsing markdown headers
  let title = meta.title || "";
  let speaker = meta.speaker || meta.author || "";
  let category = meta.category || "";
  let source = meta.source || "";
  let ingestedAt = meta.ingestedAt || "";

  // Fallback: parse from body if frontmatter minimal
  if (!title) {
    const t = body.match(/^#\s+Video Wisdom — .*?—\s*(.+)$/m);
    if (t) title = t[1].trim();
    else {
      const h = body.match(/^#\s+(.+)$/m);
      if (h) title = h[1].trim();
    }
  }
  if (!speaker) {
    const s = body.match(/\*\*Author:\*\*\s*([^\n]+)/);
    if (s) speaker = s[1].split("(")[0].trim();
    const s2 = body.match(/\*\*Speaker:\*\*\s*([^\n]+)/);
    if (s2) speaker = s2[1].trim();
  }
  if (!category) {
    // infer from content tags or title keywords
    const low = (title + " " + body.slice(0, 2000)).toLowerCase();
    if (low.includes("batman") || low.includes("fear") || low.includes("mask")) category = "Mythology";
    else if (low.includes("flow") || low.includes("kairos") || low.includes("presence") || low.includes("moment")) category = "Presence";
    else category = "General";
  }
  if (!source) {
    const u = body.match(/\*\*Source:\*\*\s*(https?:\/\/[^\s]+)/);
    if (u) source = u[1].trim();
  }
  const slug = meta.slug || fileName.replace(/\.md$/, "");
  const excerpt = (meta.excerpt || body.replace(/[#*`]/g, "").slice(0, 180).replace(/\n/g, " ").trim() + "…");
  return { title: title || fileName, speaker: speaker || "Unknown", category, source, ingestedAt, slug, excerpt, body, raw };
}

function mdToHtml(md) {
  // Minimal md → html (no deps): headers, bold, italic, code, links, lists, quotes
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // bold before italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // paragraphs: double newline
    .split(/\n{2,}/).map(block => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("<h") || block.startsWith("<li") || block.startsWith("<blockquote")) {
        // wrap li groups
        if (block.startsWith("<li")) return `<ul>${block}</ul>`;
        return block;
      }
      // keep existing html blocks (div, etc.)
      if (block.startsWith("<")) return block;
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    }).join("\n");
  return html;
}

function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function shell(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<title>${esc(title)} — Video Wisdom</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#FDFCF8;--surface:#FFFFFF;--surface-2:#F9F6F0;--ink:#1E293B;--muted:#6B7280;--border:#E7E0D6;--primary:#6B1F2A;--primary-soft:#FDF2F2;--accent:#8B5E34;--success:#2E5E4E;--radius:14px;--radius-lg:18px;--radius-xl:22px;--radius-pill:999px;--shadow-sm:0 2px 8px rgba(15,23,42,0.05);}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6}
a{color:var(--primary);text-decoration:none}a:hover{text-decoration:underline}
.siteHeader{position:sticky;top:0;z-index:40;background:var(--primary);border-bottom:1px solid rgba(255,255,255,0.14);box-shadow:0 4px 16px rgba(107,31,42,0.18)}
.siteHeader .inner{max-width:1120px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{display:flex;align-items:center;gap:10px;color:white;font-weight:700;text-decoration:none}
.brand span{font-family:'Cinzel',serif;letter-spacing:0.02em}
.hero{padding:36px 18px 28px;text-align:center;max-width:760px;margin:0 auto}
.hero h1{font-family:'Cinzel',serif;font-size:30px;margin:0}.hero h1 span{font-style:italic;color:var(--primary)}
.hero .sub{color:var(--muted);margin:8px auto 0;max-width:560px}
.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow-sm);padding:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.archCard{padding:16px;transition:transform 0.15s,box-shadow 0.15s;cursor:pointer}
.archCard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(15,23,42,0.08)}
.badge{display:inline-flex;gap:6px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:700;border:1px solid var(--border);background:var(--surface-2);color:var(--muted)}
.kjv{font-style:italic;background:linear-gradient(180deg,#FFFBEB 0%,#FFF7ED 100%);border-left:3px solid #F59E0B;padding:10px 12px;border-radius:0 12px 12px 0}
.footer{margin:36px 0 28px;text-align:center;color:var(--muted);font-size:12px}
h2{font-family:'Fraunces',serif}h3{font-size:15px}
</style>
</head>
<body>
<header class="siteHeader"><div class="inner"><a class="brand" href="../index.html"><span>Video Wisdom</span></a><nav style="display:flex;gap:8px"><a href="../index.html" style="color:white;font-size:12px;border:1px solid rgba(255,255,255,0.2);padding:6px 10px;border-radius:999px;text-decoration:none">Home</a></nav></div></header>
${bodyHtml}
<div class="footer">Video Wisdom — local extraction, static publish • <a href="https://github.com/taken2coding/video-wisdom-site">GitHub</a></div>
</body>
</html>`;
}

function build() {
  if (!fs.existsSync(contentDir)) {
    console.log(`No content yet at ${contentDir} — creating sample structure`);
    fs.mkdirSync(contentDir, { recursive: true });
  }
  const files = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter(f => f.endsWith(".md") && !f.includes("_transcript")) : [];
  const items = files.map(f => {
    const raw = fs.readFileSync(path.join(contentDir, f), "utf8");
    return extractMeta(raw, f);
  }).sort((a,b) => (b.ingestedAt || "").localeCompare(a.ingestedAt || ""));

  // Group by speaker → category
  const bySpeaker = new Map();
  for (const it of items) {
    const s = it.speaker || "Unknown";
    const c = it.category || "General";
    if (!bySpeaker.has(s)) bySpeaker.set(s, new Map());
    const byCat = bySpeaker.get(s);
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c).push(it);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(outVideosDir, { recursive: true });

  // Build per-video pages
  for (const it of items) {
    const htmlBody = mdToHtml(it.body);
    const page = shell(it.title, `
<div class="wrap" style="max-width:860px;margin:24px auto;padding:0 18px">
  <div class="card" style="margin-bottom:14px"><div class="badge">${esc(it.speaker)} • ${esc(it.category)}</div><h1 style="margin:8px 0 4px;font-family:Fraunces,serif">${esc(it.title)}</h1><p style="color:var(--muted);font-size:12px">${esc(it.ingestedAt || "")} • <a href="${esc(it.source)}" target="_blank">Source ↗</a> • <span class="badge">${esc(it.slug)}</span></p></div>
  <div class="card">${htmlBody}</div>
  <p style="margin-top:12px"><a href="../index.html">← Back to all videos</a></p>
</div>`);
    fs.writeFileSync(path.join(outVideosDir, `${it.slug}.html`), page);
  }

  // Build home index — organized by speaker → category
  let homeInner = `
<div class="hero"><h1>Video <span>Wisdom</span></h1><p class="sub">Local extraction, static publish — organized by speaker & category. ${items.length} videos, transcripts kept lean.</p><p style="margin-top:10px"><span class="badge">${items.length} videos</span> <span class="badge">${bySpeaker.size} speakers</span> <span class="badge">lean md • transcripts ignored</span></p></div>
<div class="wrap">`;

  if (items.length === 0) {
    homeInner += `<div class="card" style="text-align:center;padding:24px"><h2>No videos yet</h2><p style="color:var(--muted)">Run <code>bun Tools/ExtractWisdom.ts --url &lt;url&gt; --save</code> locally, then <code>rsync</code> to <code>content/videos/</code> and <code>npm run build</code>.</p><pre style="background:var(--surface-2);padding:12px;border-radius:12px;overflow:auto">bun ~/.claude/skills/VideoWisdom/Tools/ExtractWisdom.ts --url "https://..." --depth 5 --save\ncp ~/.claude/LIFEOS/USER/KNOWLEDGE/Research/VideoWisdom_*.md ./content/videos/\nnpm run build</pre></div>`;
  } else {
    for (const [speaker, byCat] of [...bySpeaker.entries()].sort((a,b)=>a[0].localeCompare(b[0]))) {
      homeInner += `<h2 style="margin:28px 0 10px">${esc(speaker)}</h2>`;
      for (const [cat, vids] of [...byCat.entries()].sort((a,b)=>a[0].localeCompare(b[0]))) {
        homeInner += `<h3 style="margin:14px 0 8px;color:var(--muted);font-size:12px;letter-spacing:0.06em;text-transform:uppercase">${esc(cat)} • ${vids.length}</h3><div class="grid">`;
        for (const v of vids) {
          homeInner += `<a class="card archCard" href="videos/${esc(v.slug)}.html" style="text-decoration:none;color:inherit"><div class="badge">${esc(cat)}</div><div style="font-weight:700;margin:6px 0 4px">${esc(v.title)}</div><div style="font-size:12px;color:var(--muted)">${esc(v.excerpt).slice(0,120)}</div><div style="margin-top:8px;font-size:11px;color:var(--primary);font-weight:700">Open wisdom →</div></a>`;
        }
        homeInner += `</div>`;
      }
    }
  }
  homeInner += `</div>`;
  const indexPage = shell("Video Wisdom — Speaker & Category Index", homeInner);
  fs.writeFileSync(path.join(outDir, "index.html"), indexPage);

  console.log(`Built ${items.length} videos → ${bySpeaker.size} speakers`);
  for (const [s, byCat] of bySpeaker) {
    console.log(`  ${s}: ${[...byCat.entries()].map(([c,v])=>`${c}(${v.length})`).join(", ")}`);
  }
  console.log(`Output: ${outDir}/index.html + ${outDir}/videos/*.html`);
}

build();
