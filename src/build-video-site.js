// Peter Ugwuoke — world-class brand site (best designer take)
// Investigator who uncovers what was hidden — editorial, dossier, timeless
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content/videos");
const outDir = path.join(__dirname, "../dist");
const outVideosDir = path.join(outDir, "videos");
const outGleaningsDir = path.join(outDir, "projects/gleanings/insights");
const outScriptureDir = path.join(outDir, "projects/ScriptureGuide");
const srcImagesDir = path.join(__dirname, "images");
const outImagesDir = path.join(outDir, "images");
function parseFrontmatter(raw){const m=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!m)return{meta:{},body:raw};const meta={};for(const line of m[1].split("\n")){const idx=line.indexOf(":");if(idx===-1)continue;const k=line.slice(0,idx).trim();const v=line.slice(idx+1).trim();meta[k]=v;}return{meta,body:m[2]};}
function extractMeta(raw,fileName){const {meta,body}=parseFrontmatter(raw);let title=meta.title||"";let speaker=meta.speaker||meta.author||"";let category=meta.category||"";let source=meta.source||"";let ingestedAt=meta.ingestedAt||"";let handle="";let likes="";let plays="";if(!title){const t=body.match(/^#\s+Video Wisdom — .*?—\s*(.+)$/m);if(t)title=t[1].trim();else{const h=body.match(/^#\s+(.+)$/m);if(h)title=h[1].trim();}}if(!speaker){const s=body.match(/\*\*Author:\*\*\s*([^\n]+)/);if(s){speaker=s[1].split("(")[0].trim();const mh=s[1].match(/@([a-zA-Z0-9._]+)/);if(mh)handle=mh[1];}const s2=body.match(/\*\*Speaker:\*\*\s*([^\n]+)/);if(s2)speaker=s2[1].trim();}else{const mh=speaker.match(/@([a-zA-Z0-9._]+)/);if(mh)handle=mh[1];}if(!handle){const hm=body.match(/@([a-zA-Z0-9._]+)/);if(hm)handle=hm[1];}const lk=body.match(/Likes:\s*([\d,]+)/i);if(lk)likes=lk[1];const pl=body.match(/Plays:\s*([\d,]+)/i);if(pl)plays=pl[1];if(!category){const low=(title+" "+body.slice(0,2000)).toLowerCase();if(low.includes("batman")||low.includes("fear")||low.includes("mask"))category="Mythology";else if(low.includes("flow")||low.includes("kairos")||low.includes("presence")||low.includes("moment"))category="Presence";else category="General";}if(!source){const u=body.match(/\*\*Source:\*\*\s*(https?:\/\/[^\s]+)/);if(u)source=u[1].trim();}let speakerUrl="";if(source){try{const u=new URL(source);if(u.hostname.includes("tiktok.com") && handle) speakerUrl=`https://www.tiktok.com/@${handle}`;else if(u.hostname.includes("tiktok.com")) speakerUrl=`https://www.tiktok.com/@${handle||""}`; else if(handle) speakerUrl=source; else speakerUrl=source; }catch{ speakerUrl=source; }} else if(handle) speakerUrl=`https://www.tiktok.com/@${handle}`;const cleanedForExcerpt=cleanBody(body);const slug=meta.slug||fileName.replace(/\.md$/,"");const excerpt=(meta.excerpt||cleanedForExcerpt.replace(/[#*`]/g,"").slice(0,180).replace(/\n/g," ").trim()+"…");return{title:title||fileName,speaker:speaker||"Unknown",handle,likes,plays,category,source,speakerUrl,ingestedAt,slug,excerpt,body,raw};}
function mdToHtml(md){let html=md.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/^>\s*(.+)$/gm,"<blockquote>$1</blockquote>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/^\d+\.\s+(.+)$/gm,"<li>$1</li>").split(/\n{2,}/).map(block=>{block=block.trim();if(!block)return"";if(block.startsWith("<h")||block.startsWith("<li")||block.startsWith("<blockquote")){if(block.startsWith("<li"))return `<ul>${block}</ul>`;return block;}if(block.startsWith("<"))return block;return `<p>${block.replace(/\n/g,"<br/>")}</p>`;}).join("\n");return html;}
function cleanBody(body){
  let b=body;
  b=b.replace(/^# Video Wisdom[\s\S]*?\n---\n+/m,'');
  b=b.replace(/^#\s+Video Wisdom[\s\S]*?\n---\s*\n/m,'');
  b=b.replace(/\n---\s*\n## Provenance[\s\S]*$/m,'');
  b=b.replace(/\n## Provenance[\s\S]*$/m,'');
  b=b.replace(/^## Transcript \(Verbatim\)/gm,"## Author's words");
  b=b.replace(/^## Transcript$/gm,"## Author's words");
  b=b.replace(/^## Summary \(1 paragraph\)/gm,"## Summary");
  b=b.replace(/^## Key Insights \(Distilled\)/gm,"## Key Insights");
  b=b.replace(/^## Quotes \(Verbatim, time-agnostic\)/gm,"## Key Quotes from Author");
  b=b.replace(/^## Quotes$/gm,"## Key Quotes from Author");
  b=b.replace(/^## Contrarian Take \(Required by ExtractWisdom\)/gm,"## Differing thoughts");
  b=b.replace(/^## Contrarian Take$/gm,"## Differing thoughts");
  b=b.replace(/^##\s*Contrarian Take.*$/gm,"## Differing thoughts");
  b=b.replace(/^\n+/, '').replace(/\n+$/, '');
  b=b.replace(/^---\s*\n/, '');
  return b;
}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function brandShell({title,description,bodyHtml,homeHref="index.html",gleaningsHref="projects/gleanings/insights/index.html",casesHref="#cases"}){
return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<meta name="description" content="${esc(description||"Peter Ugwuoke — builder, writer and curator of lean wisdom. Ideas distilled. Wisdom applied.")}"/>
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Newsreader:opsz,ital,wght@6..72,0,300;6..72,1,300&display=swap" rel="stylesheet">
<style>
:root{
  --paper:#FFFCF7;
  --paper-2:#F6F1E7;
  --ink:#0B0B0B;
  --ink-soft:#1A1A1A;
  --muted:#6E6E6E;
  --muted-2:#9A9A9A;
  --line:#E8E2D6;
  --line-strong:#0B0B0B;
  --accent:#24486A;
  --accent-2:#24486A;
  --max:1240px;
  --sans:'Inter',system-ui,sans-serif;
  --serif:'Instrument Serif',serif;
  --display:'Cormorant Garamond',serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}
::selection{background:var(--ink);color:var(--paper)}
/* hairline */
.hr{height:1px;background:var(--line);border:none;margin:0}
.hr-strong{height:1px;background:var(--line-strong);border:none;margin:0}
/* Top bar */
.topbar{border-bottom:1px solid var(--line);background:rgba(255,252,247,0.9);backdrop-filter:saturate(1.1) blur(8px);position:sticky;top:0;z-index:30}
.topbar-inner{max-width:var(--max);margin:0 auto;padding:0.7rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.mark{display:flex;align-items:center;gap:0.7rem}
.mark-badge{width:2rem;height:2rem;border:1px solid #24486A;background:#24486A;color:#FFFFFF;display:grid;place-items:center;font-family:var(--serif);font-size:0.85rem;letter-spacing:0.04em}
.mark-name{font-family:var(--serif);font-size:1.05rem;letter-spacing:-0.02em}
.mark-sub{font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:600;display:block;margin-top:-0.15rem}
.nav{display:flex;gap:1.2rem;align-items:center;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;color:var(--muted)}
.nav a{padding:0.2rem 0;position:relative}
.nav a.active{color:var(--ink)}
.nav a.active::after{content:"";position:absolute;left:0;right:0;bottom:-0.35rem;height:1px;background:var(--ink)}
.nav a:hover{color:var(--ink)}
.consult-desktop{display:block}
.consult-toggle{display:none;align-items:center;gap:0.4rem;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:0.5rem 0.9rem;border:1px solid var(--ink);border-radius:999px;background:var(--paper);color:var(--ink);cursor:pointer}
.consult-panel{display:none}
.topbar{position:sticky}
@media(max-width:720px){
  .consult-desktop{display:none}
  .consult-toggle{display:inline-flex}
  .consult-panel{position:absolute;top:calc(100% + 0.6rem);right:1.5rem;background:var(--paper);border:1px solid var(--line);padding:1rem 1.1rem;border-radius:0.9rem;box-shadow:0 12px 32px rgba(11,11,11,0.08);min-width:220px;z-index:50}
  .consult-panel[hidden]{display:none !important}
  .consult-panel:not([hidden]){display:block}
}
/* Hero — dossier */
.hero{max-width:var(--max);margin:0 auto;padding:2.8rem 1.5rem 1.2rem}
.hero-grid{display:grid;grid-template-columns:1.05fr 0.95fr;gap:2rem;align-items:start}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr;gap:1.6rem}}
.kicker{font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);font-weight:600;display:flex;gap:0.6rem;align-items:center}
.kicker::before{content:"";width:1.4rem;height:1px;background:var(--ink);display:inline-block}
.display{font-family:var(--serif);font-weight:400;line-height:0.86;letter-spacing:-0.03em}
.display h1{font-size:clamp(3rem,6.5vw,5.6rem);margin:0.6rem 0 0;font-weight:400;letter-spacing:-0.03em}
.display h1 em{font-family:var(--display);font-style:italic;font-weight:300;letter-spacing:-0.04em;color:var(--ink)}
.lede{font-family:'Newsreader',serif;font-size:1.08rem;line-height:1.55;color:#2B2B2B;max-width:32rem;margin:1rem 0 0;font-weight:300}
.lede strong{font-weight:600;color:var(--ink)}
.hero-actions{margin-top:1.4rem;display:flex;gap:0.6rem;flex-wrap:wrap}
.btn{font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;padding:0.75rem 1.1rem;border-radius:999px;border:1px solid var(--ink);display:inline-flex;align-items:center;gap:0.5rem;transition:all 0.2s}
.btn-primary{background:var(--ink);color:var(--paper)}
.btn-primary:hover{background:#1a1a1a;transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--ink)}
.btn-ghost:hover{background:var(--paper-2)}
.hero-meta{margin-top:1.6rem;border-top:1px solid var(--line);padding-top:0.9rem;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;font-size:0.68rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.hero-meta b{color:var(--ink);font-size:0.9rem;display:block;letter-spacing:-0.01em;text-transform:none;font-family:var(--serif);font-weight:400}
.dossier{position:relative;background:transparent;border:none;padding:0;margin-top:0.6rem}
.dossier-frame{position:relative;overflow:visible;background:transparent;aspect-ratio:3/3.4;min-height:440px;max-height:500px;display:flex;align-items:end;justify-content:center;border:none}
.dossier-frame img{width:90%;height:auto;max-height:480px;object-fit:contain;object-position:center bottom;display:block;filter:drop-shadow(0 16px 24px rgba(11,11,11,0.08));background:transparent}
@media(max-width:900px){.dossier{margin-top:0}.dossier-frame{min-height:380px;aspect-ratio:4/3}}
.dossier-label{position:absolute;top:0.7rem;left:0.7rem;background:var(--paper);border:1px solid var(--ink);padding:0.35rem 0.55rem;font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;display:flex;gap:0.5rem;align-items:center}
.dossier-label i{width:0.45rem;height:0.45rem;background:var(--accent-2);border-radius:50%;display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
.dossier-caption{position:absolute;left:0.7rem;right:0.7rem;bottom:0.7rem;background:rgba(255,252,247,0.94);border:1px solid rgba(11,11,11,0.1);padding:0.7rem 0.8rem;backdrop-filter:blur(6px)}
.dossier-caption .q{font-family:var(--display);font-style:italic;font-size:0.95rem;line-height:1.35;color:var(--ink)}
.dossier-caption .a{font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-top:0.4rem;font-weight:600}
/* Manifesto */
.manifesto{max-width:var(--max);margin:0 auto;padding:2.2rem 1.5rem;border-top:1px solid var(--line-strong);border-bottom:1px solid var(--line);margin-top:1.2rem}
.manifesto p{font-family:var(--display);font-size:clamp(1.4rem,3vw,2.1rem);line-height:1.25;font-weight:300;max-width:52rem;margin:0}
.manifesto p em{font-style:italic}
.manifesto .meta{margin-top:0.8rem;font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:600}
/* Cases */
.section{max-width:var(--max);margin:0 auto;padding:2.2rem 1.5rem}
.section-head{display:flex;justify-content:space-between;align-items:end;gap:1rem;margin-bottom:1.4rem;flex-wrap:wrap}
.section-head h2{font-family:var(--serif);font-size:1.9rem;letter-spacing:-0.02em;margin:0;font-weight:400}
.section-head p{font-size:0.82rem;color:var(--muted);max-width:32rem;margin:0;line-height:1.5}
.case{border-top:1px solid var(--line-strong);padding:1.6rem 0;display:grid;grid-template-columns:0.9fr 1.1fr;gap:2rem;align-items:center}
.case:last-child{border-bottom:1px solid var(--line-strong)}
.case:nth-child(even){grid-template-columns:1.1fr 0.9fr}
.case:nth-child(even) .case-media{order:-1}
@media(max-width:900px){.case,.case:nth-child(even){grid-template-columns:1fr}.case:nth-child(even) .case-media{order:0}}
.case-kicker{font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
.case h3{font-family:var(--serif);font-size:2rem;line-height:0.95;letter-spacing:-0.02em;margin:0.4rem 0 0;font-weight:400}
.case h3 em{font-style:italic}
.case-desc{font-size:0.88rem;line-height:1.6;color:#2B2B2B;margin:0.7rem 0 0;max-width:30rem}
.case-meta{margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;font-size:0.62rem;letter-spacing:0.06em;text-transform:uppercase;font-weight:700;color:var(--muted)}
.case-meta span{border:1px solid var(--line);padding:0.25rem 0.55rem;border-radius:999px;background:var(--paper)}
.case-cta{margin-top:1.1rem;display:inline-flex;align-items:center;gap:0.5rem;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;border-bottom:1px solid var(--ink);padding-bottom:0.2rem}
.case-cta:hover{border-color:var(--accent)}
.case-media{position:relative;overflow:hidden;border:1px solid var(--line);background:var(--paper-2);aspect-ratio:4/3}
.case-media img{width:100%;height:100%;object-fit:cover;display:block}
.case-media .media-label{position:absolute;top:0.6rem;left:0.6rem;background:var(--ink);color:var(--paper);font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.3rem 0.5rem;font-weight:700}
/* Icon projects — requested list */
.icon-projects{display:flex;flex-direction:column;gap:0.7rem;border-top:1px solid var(--line-strong);padding-top:1.2rem;margin-top:0.2rem}
.icon-project{display:flex;gap:1rem;align-items:center;padding:1rem 1.1rem;border:1px solid var(--line);background:var(--paper);text-decoration:none;transition:all 0.15s}
.icon-project:hover{border-color:#24486A;background:var(--paper-2);transform:translateY(-1px)}
.icon-project .icon-box{width:2.6rem;height:2.6rem;border:1px solid var(--ink);display:grid;place-items:center;font-size:1.15rem;flex-shrink:0;background:var(--paper);font-family:var(--serif);transition:all 0.15s}
.icon-project:hover .icon-box{border-color:#24486A;background:#24486A;color:#FFFFFF}
.icon-project-text{flex:1;min-width:0}
.icon-project-title{font-family:var(--serif);font-size:1.2rem;line-height:1.1;letter-spacing:-0.01em}
.icon-project-desc{font-size:0.82rem;color:var(--muted);margin-top:0.28rem;line-height:1.45;max-width:38rem}
.icon-project-meta{font-size:0.62rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-top:0.35rem}
.icon-project-arrow{width:1.9rem;height:1.9rem;border:1px solid var(--ink);border-radius:50%;display:grid;place-items:center;font-size:0.85rem;flex-shrink:0;background:var(--paper);transition:all 0.15s}
.icon-project:hover .icon-project-arrow{background:#24486A;border-color:#24486A;color:#FFFFFF}
.service-card{display:flex;gap:0.8rem;align-items:start;padding:0.85rem 0.9rem;border:1px solid var(--line);background:var(--paper);transition:all 0.15s}
.service-card:hover{border-color:#24486A;transform:translateY(-1px)}
.service-card:hover .icon-box{border-color:#24486A;background:#24486A;color:#FFFFFF}
.service-card .icon-box{width:1.9rem;height:1.9rem;flex-shrink:0;border:1px solid var(--ink);display:grid;place-items:center;font-size:0.85rem;background:var(--paper);transition:all 0.15s}
/* Insights index */
.index-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:1rem}
.index-card{grid-column:span 4;border:1px solid var(--line);background:var(--paper);padding:1.25rem;border-radius:0.9rem;box-shadow:0 1px 3px rgba(11,11,11,0.04);display:flex;flex-direction:column;gap:0.7rem;transition:all 0.2s}
.index-card:hover{border-color:var(--ink);box-shadow:0 8px 24px rgba(11,11,11,0.07);transform:translateY(-2px)}
@media(max-width:900px){.index-card{grid-column:span 6}}
@media(max-width:600px){.index-card{grid-column:span 12}}
.index-card .eyebrow{font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-weight:700}
.index-card h4{font-family:var(--serif);font-size:1.15rem;line-height:1.15;margin:0;font-weight:400}
.index-card p{font-size:0.78rem;color:var(--muted);line-height:1.5;margin:0}
.index-card .foot{margin-top:auto;padding-top:0.6rem;border-top:1px solid var(--line);font-size:0.62rem;letter-spacing:0.06em;text-transform:uppercase;font-weight:700;display:flex;justify-content:space-between;align-items:center;color:var(--muted)}
.badge{font-size:0.58rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;border:1px solid var(--line);padding:0.2rem 0.45rem;border-radius:999px;background:var(--paper-2)}
.badge-live{background:var(--ink);color:var(--paper);border-color:var(--ink)}
/* Prose */
.prose{font-size:0.96rem;line-height:1.78;color:#1F1F1F;max-width:68ch}
.prose h1{font-family:var(--serif);font-size:1.85rem;line-height:1.1;letter-spacing:-0.02em;margin:1.8rem 0 0.7rem;font-weight:400}
.prose h2{font-family:var(--serif);font-size:1.32rem;line-height:1.3;letter-spacing:-0.01em;margin:1.7rem 0 0.6rem;padding-bottom:0.4rem;border-bottom:1px solid var(--line);font-weight:400}
.prose h3{font-family:var(--serif);font-size:1.05rem;margin:1.4rem 0 0.5rem;font-weight:600}
.prose p{margin:0.9rem 0}
.prose blockquote{border-left:3px solid #24486A;margin:1.3rem 0;padding:0.9rem 1.1rem;background:var(--paper-2);border-radius:0 0.6rem 0.6rem 0;font-style:italic;color:#2B2B2B;box-shadow:0 1px 6px rgba(11,11,11,0.04)}
.prose ul{margin:0.9rem 0;padding-left:1.2rem;list-style:none}
.prose ul li{position:relative;padding-left:0.9rem;margin:0.55rem 0}
.prose ul li::before{content:"—";position:absolute;left:0;color:#24486A;font-weight:700}
.prose code{background:var(--paper-2);border:1px solid var(--line);padding:0.16rem 0.38rem;border-radius:0.35rem;font-size:0.82rem;font-family:var(--mono)}
.prose a{color:#24486A;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(36,72,106,0.3)}
.prose a:hover{color:#24486A;text-decoration-color:#24486A}
.wrap{max-width:var(--max);margin:0 auto;padding:0 1.5rem}
.footer{border-top:none;margin-top:2.5rem;padding:1.4rem 1.5rem;text-align:center;color:#FFFFFF;background:#24486A;font-size:0.72rem}
.footer a{color:#FFFFFF;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(255,255,255,0.6)}
.footer a:hover{color:#FFFFFF;text-decoration-color:#FFFFFF}
</style>
</head>
<body>
<header class="topbar"><div class="topbar-inner"><a class="mark" href="${esc(homeHref)}"><span class="mark-badge">PU</span><span><span class="mark-name">Peter Ugwuoke</span><span class="mark-sub">Due Diligence | Data Privacy | Compliance | Cybersecurity | AI</span></span></a><nav class="nav" style="position:relative"><div class="consult-desktop" style="text-align:right;line-height:1.3"><div style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--ink)">Consult</div><div style="font-size:0.68rem;color:var(--ink);margin-top:0.15rem;text-transform:none">peterugwuokeify@gmail.com<br/>+2349076117035</div></div><button class="consult-toggle" aria-expanded="false" aria-controls="consult-panel" type="button">Consult</button><div id="consult-panel" class="consult-panel" hidden><div style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--ink)">Consult</div><div style="font-size:0.68rem;color:var(--ink);margin-top:0.4rem;line-height:1.4">peterugwuokeify@gmail.com<br/>+2349076117035</div></div></nav></div></header>
${bodyHtml}
<footer class="footer"><div style="max-width:var(--max);margin:0 auto"><a href="${esc(homeHref)}" style="text-decoration:none;color:inherit">© ${new Date().getFullYear()} Peter Ugwuoke • Africa/Lagos</a></div></footer>
<script>(function(){var b=document.querySelector('.consult-toggle'),p=document.getElementById('consult-panel');if(!b||!p)return;b.addEventListener('click',function(e){e.stopPropagation();var x=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!x);p.hidden=x;});document.addEventListener('click',function(e){if(!p.hidden&&!p.contains(e.target)&&e.target!==b){p.hidden=true;b.setAttribute('aria-expanded','false');}});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!p.hidden){p.hidden=true;b.setAttribute('aria-expanded','false');}});})();</script>
</body>
</html>`;}
function build(){
if(!fs.existsSync(contentDir)){fs.mkdirSync(contentDir,{recursive:true});}
const files=fs.existsSync(contentDir)?fs.readdirSync(contentDir).filter(f=>f.endsWith(".md")&&!f.includes("_transcript")):[];
const items=files.map(f=>{const raw=fs.readFileSync(path.join(contentDir,f),"utf8");return extractMeta(raw,f);}).sort((a,b)=>(b.ingestedAt||"").localeCompare(a.ingestedAt||""));
const bySpeaker=new Map();for(const it of items){const s=it.speaker||"Unknown";const c=it.category||"General";if(!bySpeaker.has(s))bySpeaker.set(s,new Map());const byCat=bySpeaker.get(s);if(!byCat.has(c))byCat.set(c,[]);byCat.get(c).push(it);}
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(outVideosDir,{recursive:true});fs.mkdirSync(outGleaningsDir,{recursive:true});fs.mkdirSync(outScriptureDir,{recursive:true});fs.mkdirSync(outImagesDir,{recursive:true});
try{
  if(fs.existsSync(srcImagesDir)){
    for(const f of fs.readdirSync(srcImagesDir)){
      if(/^sirP_main\.(jpe?g|png|webp|avif)$/i.test(f)){
        fs.copyFileSync(path.join(srcImagesDir,f),path.join(outImagesDir,f));
        if(f.toLowerCase()==="sirp_main.jpeg"){
          const alt=path.join(outImagesDir,"sirP_main.jpg");
          if(!fs.existsSync(alt)) fs.copyFileSync(path.join(srcImagesDir,f),alt);
        }
        if(f.toLowerCase()==="sirp_main.jpg"){
          const alt=path.join(outImagesDir,"sirP_main.jpeg");
          if(!fs.existsSync(alt)) fs.copyFileSync(path.join(srcImagesDir,f),alt);
        }
      }
    }
  }
}catch(e){}
for(const it of items){const cleaned=cleanBody(it.body);const htmlBody=mdToHtml(cleaned);const speakerBtn=it.speakerUrl ? `<a href="${esc(it.speakerUrl)}" target="_blank" rel="noopener" style="font-size:0.68rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;border:1px solid var(--ink);padding:0.38rem 0.75rem;border-radius:999px;background:var(--ink);color:var(--paper);text-decoration:none">Speaker: ${esc(it.speaker)}${it.handle?' @'+esc(it.handle):''} ↗</a>` : `<span style="font-size:0.68rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;border:1px solid var(--line);padding:0.38rem 0.75rem;border-radius:999px;background:var(--paper-2)">${esc(it.speaker)}</span>`;const sourceBtn=it.source ? `<a href="${esc(it.source)}" target="_blank" rel="noopener" style="font-size:0.68rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;border:1px solid var(--line);padding:0.38rem 0.75rem;border-radius:999px;background:var(--paper);text-decoration:none">View source ↗</a>` : ``;const metaLine=`<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.9rem;align-items:center">${speakerBtn}${sourceBtn}${it.likes?`<span style="font-size:0.68rem;color:var(--muted);border:1px solid var(--line);padding:0.38rem 0.65rem;border-radius:999px;background:var(--paper)">♥ ${esc(it.likes)} likes</span>`:''}${it.plays?`<span style="font-size:0.68rem;color:var(--muted);border:1px solid var(--line);padding:0.38rem 0.65rem;border-radius:999px;background:var(--paper)">${esc(it.plays)} plays</span>`:''}</div>`;const breadcrumb=`<div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.9rem;font-weight:600"><a href="../../../index.html" style="color:var(--muted);text-decoration:none">Home</a> <span style="opacity:0.4">/</span> <a href="../../../index.html#cases" style="color:var(--muted)">Projects</a> <span style="opacity:0.4">/</span> <a href="index.html" style="color:var(--muted)">Gleanings</a> <span style="opacity:0.4">/</span> <span style="color:var(--ink)">${esc(it.category)}</span></div>`;const pageInner=`<div class="wrap" style="max-width:800px;margin:1.8rem auto"><div style="background:var(--paper);border:1px solid var(--line-strong);padding:1.2rem 1.2rem 1rem"><div class="kicker">${esc(it.category)} • ${esc(it.speaker)}</div><h1 style="font-family:var(--serif);font-size:2.15rem;line-height:0.98;letter-spacing:-0.02em;margin:0.6rem 0 0;font-weight:400">${esc(it.title)}</h1>${metaLine}</div><div style="background:var(--paper);border:1px solid var(--line);border-top:none;padding:1.4rem 1.3rem" class="prose">${htmlBody}</div><div style="margin-top:1.1rem;display:flex;gap:0.6rem;flex-wrap:wrap"><a href="index.html" style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;border-bottom:1px solid var(--ink);padding-bottom:0.15rem;text-decoration:none">← Back to Gleanings</a><span style="opacity:0.3">•</span><a href="../../../index.html" style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:var(--muted);text-decoration:none">Home</a></div></div>`;const page=brandShell({title:`${it.title} — Gleanings`,description:it.excerpt.slice(0,150),bodyHtml:pageInner,homeHref:"../../../index.html",gleaningsHref:"index.html",casesHref:"../../../index.html#cases"});fs.writeFileSync(path.join(outGleaningsDir,`${it.slug}.html`),page);fs.writeFileSync(path.join(outVideosDir,`${it.slug}.html`),page);}
let gleaningsInner=`<div class="wrap" style="max-width:1240px;margin:1.2rem auto"><div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:600"><a href="../../../index.html" style="color:var(--muted);text-decoration:none">Home</a> <span style="opacity:0.4">/</span> <a href="../../../index.html#cases" style="color:var(--muted)">Projects</a> <span style="opacity:0.4">/</span> <a href="index.html" style="color:var(--muted)">Gleanings</a> <span style="opacity:0.4">/</span> Insights</div>`;
if(items.length===0){gleaningsInner+=`<div style="border:1px solid var(--line);padding:1.5rem;text-align:center;color:var(--muted)">No gleanings yet</div>`;}else{for(const [speaker,byCat] of [...bySpeaker.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){gleaningsInner+=`<h2 style="font-family:var(--serif);font-size:1.2rem;margin:1.4rem 0 0.6rem;border-top:1px solid var(--line);padding-top:0.8rem">${esc(speaker)}</h2>`;for(const [cat,vids] of [...byCat.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){gleaningsInner+=`<div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0.8rem 0 0.6rem">${esc(cat)} • ${vids.length}</div><div class="index-grid">`;for(const v of vids){gleaningsInner+=`<a class="index-card" href="${esc(v.slug)}.html"><div class="eyebrow" style="font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(cat)}</div><h4>${esc(v.title)}</h4><p>${esc(v.excerpt).slice(0,130)}</p><div class="foot"><span>${esc(v.speaker)}</span><span>→</span></div></a>`;}gleaningsInner+=`</div>`;}}
}gleaningsInner+=`</div>`;const gleaningsPage=brandShell({title:"Gleanings — Insights",description:`Video wisdom distilled — ${items.length} insights`,bodyHtml:gleaningsInner,homeHref:"../../../index.html",gleaningsHref:"index.html",casesHref:"../../../index.html#cases"});fs.writeFileSync(path.join(outGleaningsDir,"index.html"),gleaningsPage);
const scriptureInner=`<div class="wrap" style="max-width:760px;margin:2rem auto;text-align:center"><div class="kicker">Projects / ScriptureGuide</div><h1 style="font-family:var(--serif);font-size:2.2rem;margin:0.4rem 0">ScriptureGuide</h1><p style="color:var(--muted);font-size:0.95rem;max-width:34rem;margin:0.5rem auto">Biblical counsel for everyday life — curated Scripture, plain-language guidance. Hosted at <strong style="color:var(--ink)">biblecounselor.com.ng</strong>.</p><p style="margin:1.2rem 0;display:flex;gap:0.6rem;justify-content:center"><a class="btn btn-primary" href="https://biblecounselor.com.ng" target="_blank" rel="noopener">Open biblecounselor.com.ng ↗</a><a class="btn btn-ghost" href="../../index.html">Back</a></p><p style="font-size:0.72rem;color:var(--muted);margin-top:1rem">Alias: <code>projects/ScriptureGuide</code> → external. Redirects in 1.5s.</p></div><script>setTimeout(()=>location.href="https://biblecounselor.com.ng",1500)</script>`;const scripturePage=brandShell({title:"ScriptureGuide — biblecounselor.com.ng",description:"ScriptureGuide — biblical counsel at biblecounselor.com.ng",bodyHtml:scriptureInner,homeHref:"../../index.html",gleaningsHref:"../gleanings/insights/index.html",casesHref:"../../index.html#cases"});fs.writeFileSync(path.join(outScriptureDir,"index.html"),scripturePage);
const cases=[
{num:"01",title:"Work",subtitle:"LinkedIn",desc:"Professional history, roles and selected work — connect and see experience.",meta:"linkedin.com/in/peterugwuoke ↗",href:"https://www.linkedin.com/in/peterugwuoke",cta:"View LinkedIn",external:true,icon:"◎",img:"",kicker:"Profile"},
{num:"02",title:"NaijaPrivacyGuide",subtitle:"Data privacy",desc:"Nigeria data-privacy guide — practical explainers, rights and compliance notes for everyday users.",meta:"Facebook — NaijaPrivacyGuide ↗",href:"https://www.facebook.com/profile.php?id=61593746679286",cta:"Visit page",external:true,icon:"◉",img:"",kicker:"Guide"},
{num:"03",title:"BibleCounsel",subtitle:"Scripture guide",desc:"Curated biblical counsel by life situation — plain-language guidance. Pastoral tool, Scripture first.",meta:"www.biblecounselor.com.ng ↗",href:"https://www.biblecounselor.com.ng",cta:"Visit site",external:true,icon:"✦",img:"",kicker:"Project"},
{num:"04",title:"Shop HighFive",subtitle:"E-commerce",desc:"Curated storefront — browse products, collections and checkout. Retail made lean and fast.",meta:"www.shop.highfiveltd.com ↗",href:"https://www.shop.highfiveltd.com",cta:"Visit shop",external:true,icon:"⬡",img:"",kicker:"Store"},
{num:"05",title:"Gleanings",subtitle:"Video wisdom",desc:"Personal reflections on what I learn from great individuals",meta:`${items.length} insights • ${bySpeaker.size} speakers`,href:"projects/gleanings/insights/index.html",cta:"Open Gleanings",icon:"◐",img:"",kicker:"Archive"},
{num:"06",title:"Socials",subtitle:"Facebook",desc:"Everyday updates, conversations and community — follow along.",meta:"facebook.com/sirp4change ↗",href:"https://www.facebook.com/sirp4change/",cta:"Follow",external:true,icon:"○",img:"",kicker:"Community"}
];
let homeInner=`
<div class="hero" style="padding-bottom:0.8rem">
  <div class="hero-grid" style="grid-template-columns:0.9fr 1.1fr;gap:2rem;align-items:center;max-width:var(--max);margin:0 auto;padding:0 1.5rem">
    <div style="display:flex;justify-content:center;align-items:center">
      <img src="images/sir_p_main.png" alt="Peter Ugwuoke — portrait" style="width:92%;max-width:420px;height:auto;max-height:520px;object-fit:cover;object-position:35% 18%;clip-path:polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%);filter:drop-shadow(0 16px 24px rgba(11,11,11,0.08))" onerror="this.src='images/sirP_main.png'"/>
    </div>
    <div class="display" style="text-align:right"><h1>Securing <em>Trust,</em><br/>Scaling <em>Innovation.</em></h1><div style="margin-top:0.9rem;display:flex;justify-content:flex-end"><a href="#how-i-help" style="display:inline-flex;align-items:center;gap:0.5rem;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:0.75rem 1.4rem;border-radius:999px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);text-decoration:none">How I help ↓</a></div></div>
  </div>
</div>
<div id="how-i-help" style="max-width:var(--max);margin:0 auto;padding:1.6rem 1.5rem 0;scroll-margin-top:84px">
  <div style="border-top:1px solid var(--line-strong);padding-top:1.4rem">
    <h3 style="font-family:var(--serif);font-size:1.55rem;line-height:1.1;margin:0;font-weight:400;color:#FFFFFF;background:#24486A;padding:0.45rem 0.75rem;display:inline-block">I help businesses:</h3>
    <div style="margin-top:1rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:0.65rem">
      <div class="service-card"><div class="icon-box">◈</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Navigate highly complex and regulated business environments by remaining compliant</div></div>
      <div class="service-card"><div class="icon-box">◎</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Scope and conduct comprehensive Due Diligence investigations</div></div>
      <div class="service-card"><div class="icon-box">⬢</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Install fraud prevention &amp; detection mechanisms</div></div>
      <div class="service-card"><div class="icon-box">⬣</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Corporate Records Search / Beneficiary Ownership Searches</div></div>
      <div class="service-card"><div class="icon-box">⬡</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Top-Level Local &amp; International Screening Solutions</div></div>
      <div class="service-card"><div class="icon-box">⚖</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Cross-border criminal records Checks</div></div>
      <div class="service-card"><div class="icon-box">◉</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Local-International PEP / Global watchlists</div></div>
      <div class="service-card"><div class="icon-box">📰</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Adverse Media Searches</div></div>
      <div class="service-card"><div class="icon-box">◎</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Financial Liability checks</div></div>
      <div class="service-card"><div class="icon-box">⬢</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Identity Checks</div></div>
      <div class="service-card"><div class="icon-box">⬢</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">HUMINT • OSINT • SOCMINT</div></div>
      <div class="service-card"><div class="icon-box">◐</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">On-ground Discreet / Non-Discreet investigations</div></div>
    </div>
  </div>
</div>
<div class="section" id="cases" style="padding-top:1.2rem">
  <div style="margin-bottom:1rem"><h3 style="font-family:var(--serif);font-size:1.55rem;line-height:1.1;font-weight:400;color:#FFFFFF;background:#24486A;padding:0.45rem 0.75rem;display:inline-block">Projects I'm involved in</h3></div>
  <div class="icon-projects">
`;
for(const c of cases){
homeInner+=`<a class="icon-project" href="${esc(c.href)}" ${c.external?'target="_blank" rel="noopener"':''}><div class="icon-box">${esc(c.icon)}</div><div class="icon-project-text"><div class="icon-project-title">${esc(c.title)} <span style="font-weight:400;color:var(--muted);font-size:0.95rem">— ${esc(c.subtitle)}</span></div><div class="icon-project-desc">${esc(c.desc)}</div><div class="icon-project-meta">${esc(c.meta)}</div></div><div class="icon-project-arrow">→</div></a>`;
}
homeInner+=`</div></div>`;
const indexPage=brandShell({title:"Peter Ugwuoke — Securing Trust, Scaling Innovation.",description:"Peter Ugwuoke — Due Diligence | Data Privacy | Compliance | Cybersecurity | AI. Projects: Gleanings, BibleCounsel, Shop HighFive, NaijaPrivacyGuide, Work and Socials.",bodyHtml:homeInner});
fs.writeFileSync(path.join(outDir,"index.html"),indexPage);
const projectsIndexDir=path.join(outDir,"projects");fs.mkdirSync(projectsIndexDir,{recursive:true});
const projectsIndexInner=`<div class="wrap" style="max-width:860px;margin:1.6rem auto"><div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:600"><a href="../index.html" style="color:var(--muted);text-decoration:none">Home</a> <span style="opacity:0.4">/</span> Cases</div><h1 style="font-family:var(--serif);font-size:2rem;margin:0.6rem 0">Cases</h1><div style="display:grid;gap:1rem;margin-top:1rem"><a href="gleanings/insights/index.html" style="border:1px solid var(--ink);padding:1rem;display:block;text-decoration:none"><div style="font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--muted)">01 — Live archive</div><div style="font-family:var(--serif);font-size:1.4rem;color:var(--ink)">Gleanings</div><div style="font-size:0.82rem;color:var(--muted)">Video wisdom → lean markdown insights</div></a><a href="https://biblecounselor.com.ng" target="_blank" rel="noopener" style="border:1px solid var(--line);padding:1rem;display:block;text-decoration:none"><div style="font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--muted)">02 — External</div><div style="font-family:var(--serif);font-size:1.4rem;color:var(--ink)">ScriptureGuide ↗</div><div style="font-size:0.82rem;color:var(--muted)">biblecounselor.com.ng</div></a></div></div>`;
const projectsIndexPage=brandShell({title:"Cases — Peter Ugwuoke",description:"Cases — Peter Ugwuoke",bodyHtml:projectsIndexInner,homeHref:"../index.html",gleaningsHref:"gleanings/insights/index.html",casesHref:"../index.html#cases"});
fs.writeFileSync(path.join(projectsIndexDir,"index.html"),projectsIndexPage);
console.log(`Built ${items.length} videos → ${bySpeaker.size} speakers`);
console.log(`Output: ${outDir}/index.html (editorial) + ${outGleaningsDir}/index.html`);
}
build();
