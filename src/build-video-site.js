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
function paginateLongParagraph(text){
  const sents=text.split(/(?<=[.!?])\s+(?=[A-Z0-9“"\(])/);
  if(sents.length<=3) return [text.trim()];
  const paras=[]; const CHUNK=3;
  for(let i=0;i<sents.length;i+=CHUNK){
    const chunk=sents.slice(i,i+CHUNK).join(" ").trim();
    if(chunk) paras.push(chunk);
  }
  return paras;
}
function enhanceAuthorsWords(html){
  const marker="<h2>Author's words</h2>";
  const idx=html.indexOf(marker);
  if(idx===-1) return html;
  const after=html.slice(idx+marker.length);
  const nextH2=after.search(/<h2>/);
  const sectionEnd=nextH2===-1 ? after.length : nextH2;
  const sectionInner=after.slice(0,sectionEnd);
  const rest=after.slice(sectionEnd);
  let inner=sectionInner;
  const pCount=(inner.match(/<p>/g)||[]).length;
  const pMatch=inner.match(/<p>([\s\S]*?)<\/p>/);
  if(pMatch && pCount===1){
    let raw=pMatch[1].replace(/<br\/?>/g," ").replace(/\s+/g," ").trim();
    raw=raw.replace(/\s*---\s*/g," ").trim();
    if(raw.length>600){
      let paras=paginateLongParagraph(raw);
      paras=paras.map(p=>p.replace(/\s*---\s*/g," ").trim()).filter(p=>p && p!=="---");
      const newPs=paras.map(t=>`<p>${t}</p>`).join("\n");
      const withoutP=inner.replace(/<p>[\s\S]*?<\/p>/,"").replace(/<p>\s*---\s*<\/p>/g,"").trim();
      inner="\n"+newPs+"\n"+(withoutP?withoutP+"\n":"");
    }
  } else if(pCount===0){
    // mdToHtml left plain text after <h2> without <p> (no blank line) — paginate it
    let raw=inner.replace(/<br\/?>/g," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    raw=raw.replace(/\s*---\s*/g," ").trim();
    if(raw.length>300){
      let paras=paginateLongParagraph(raw);
      paras=paras.map(p=>p.replace(/\s*---\s*/g," ").trim()).filter(p=>p && p!=="---");
      inner="\n"+paras.map(t=>`<p>${t}</p>`).join("\n")+"\n";
    } else if(raw){
      raw=raw.replace(/\s*---\s*/g," ").trim();
      if(raw) inner=`\n<p>${raw}</p>\n`;
    }
  } else {
    // clean stray hr paragraph if present
    inner=inner.replace(/<p>\s*---\s*<\/p>/g,"");
  }
  const wrapped=`\n<div class="authors-words">\n${inner.trim()}\n</div>\n`;
  return html.slice(0,idx+marker.length)+wrapped+rest;
}
function enhanceSummary(html){
  const marker="<h2>Summary</h2>";
  const idx=html.indexOf(marker);
  if(idx===-1) return html;
  const after=html.slice(idx+marker.length);
  const nextH2=after.search(/<h2>/);
  const sectionEnd=nextH2===-1 ? after.length : nextH2;
  const sectionInner=after.slice(0,sectionEnd);
  const rest=after.slice(sectionEnd);
  let inner=sectionInner.trim();
  if(!inner) return html;
  // Ensure content is paragraph-wrapped for kerning container
  const hasP=inner.includes("<p>");
  if(!hasP){
    let raw=inner.replace(/<br\/?>/g," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    raw=raw.replace(/\s*---\s*/g," ").trim();
    if(raw) inner=`<p>${raw}</p>`;
  } else {
    inner=inner.replace(/<p>\s*---\s*<\/p>/g,"").trim();
  }
  const wrapped=`\n<div class="summary-words">\n${inner}\n</div>\n`;
  return html.slice(0,idx+marker.length)+wrapped+rest;
}
function enhanceDifferingThoughts(html){
  const marker="<h2>Differing thoughts</h2>";
  const idx=html.indexOf(marker);
  if(idx===-1) return html;
  const after=html.slice(idx+marker.length);
  const nextH2=after.search(/<h2>/);
  const sectionEnd=nextH2===-1 ? after.length : nextH2;
  const sectionInner=after.slice(0,sectionEnd);
  const rest=after.slice(sectionEnd);
  let inner=sectionInner.trim();
  if(!inner) return html;
  const hasP=inner.includes("<p>");
  if(!hasP){
    let raw=inner.replace(/<br\/?>/g," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    raw=raw.replace(/\s*---\s*/g," ").trim();
    if(raw) inner=`<p>${raw}</p>`;
  } else {
    inner=inner.replace(/<p>\s*---\s*<\/p>/g,"").trim();
  }
  const wrapped=`\n<div class="differing-words">\n${inner}\n</div>\n`;
  return html.slice(0,idx+marker.length)+wrapped+rest;
}
function enhanceKeyQuotes(html){
  const marker="<h2>Key Quotes from Author</h2>";
  const idx=html.indexOf(marker);
  if(idx===-1) return html;
  const after=html.slice(idx+marker.length);
  const nextH2=after.search(/<h2>/);
  const sectionEnd=nextH2===-1 ? after.length : nextH2;
  const sectionInner=after.slice(0,sectionEnd);
  const rest=after.slice(sectionEnd);
  let inner=sectionInner.trim();
  if(!inner) return html;
  // Strip stray hr paragraphs and keep ul/p structure
  inner=inner.replace(/<p>\s*---\s*<\/p>/g,"").trim();
  if(!inner) return html.slice(0,idx+marker.length)+rest;
  const wrapped=`\n<div class="quotes-words">\n${inner}\n</div>\n`;
  return html.slice(0,idx+marker.length)+wrapped+rest;
}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function brandShell({title,description,bodyHtml,homeHref="index.html",gleaningsHref="projects/gleanings/insights/index.html",casesHref="#cases"}){
return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<meta name="description" content="${esc(description||"Peter Ugwuoke — Due Diligence Lead with expertise in Due Diligence Investigations, Compliance knowhow and Data privacy expertise. Helping businesses navigate complex regulated environments with screening, background checks and risk intelligence.")}"/>
<meta name="keywords" content="Peter Ugwuoke, Due Diligence, Data Privacy, Compliance, Cybersecurity, AI, Background Checks, Corporate Records, Beneficiary Ownership, PEP Screening, Adverse Media, OSINT, Nigeria"/>
<meta name="author" content="Peter Ugwuoke"/>
<meta name="robots" content="index, follow, max-image-preview:large"/>
<link rel="canonical" href="https://www.peterugwuoke.com.ng/"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Peter Ugwuoke"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description||"Peter Ugwuoke — Due Diligence Lead with expertise in Due Diligence Investigations, Compliance knowhow and Data privacy expertise.")}"/>
<meta property="og:url" content="https://www.peterugwuoke.com.ng/"/>
<meta property="og:image" content="https://www.peterugwuoke.com.ng/images/sir_p_main.png"/>
<meta property="og:image:alt" content="Peter Ugwuoke — portrait"/>
<meta property="og:image:width" content="1280"/>
<meta property="og:image:height" content="1280"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description||"Peter Ugwuoke — Due Diligence Lead with expertise in Due Diligence Investigations, Compliance knowhow and Data privacy expertise.")}"/>
<meta name="twitter:image" content="https://www.peterugwuoke.com.ng/images/sir_p_main.png"/>
<meta name="twitter:creator" content="@sirp4change"/>
<meta property="og:locale" content="en_NG"/>
<link rel="icon" href="/favicon.ico" sizes="any"/>
<link rel="shortcut icon" href="/favicon.ico"/>
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-32.png"/>
<link rel="icon" type="image/png" sizes="512x512" href="/images/favicon.png"/>
<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png"/>
<meta name="theme-color" content="#24486A"/>
<script defer src="https://umami-postgresql-latest-8xgn.onrender.com/script.js" data-website-id="c254ecd5-4d1d-4bae-840d-b46fd131b45e"></script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Peter Ugwuoke","jobTitle":"Due Diligence Lead - Background Check International","description":"Due Diligence Lead with expertise in Due Diligence Investigations, Compliance knowhow and Data privacy expertise","url":"https://www.peterugwuoke.com.ng/","image":"https://www.peterugwuoke.com.ng/images/sir_p_main.png","sameAs":["https://www.linkedin.com/in/peterugwuoke","https://www.facebook.com/sirp4change/","https://www.biblecounselor.com.ng","https://www.shop.highfiveltd.com"],"knowsAbout":["Due Diligence","Data Privacy","Compliance","Cybersecurity","AI","Background Checks","Corporate Records","PEP Screening"]}</script>
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
/* Hero — dossier — mobile-first */
.hero{max-width:var(--max);margin:0 auto;padding:1.6rem 1rem 1rem}
.hero-grid{display:grid;grid-template-columns:1fr;gap:1.2rem;align-items:start}
@media(min-width:900px){.hero{padding:2.8rem 1.5rem 1.2rem}.hero-grid{grid-template-columns:0.9fr 1.1fr;gap:2rem;align-items:center}}
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
.dossier{position:relative;background:transparent;border:none;padding:0;margin-top:0}
.dossier-frame{position:relative;overflow:visible;background:transparent;width:100%;aspect-ratio:1/1;min-height:auto;max-height:none;display:flex;align-items:end;justify-content:center;border:none}
.dossier-frame img{width:100%;max-width:100%;height:auto;max-height:none;aspect-ratio:1/1;object-fit:cover;object-position:35% 18%;clip-path:polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%);filter:drop-shadow(0 12px 20px rgba(11,11,11,0.08));background:transparent}
@media(min-width:900px){.dossier{margin-top:0.6rem}.dossier-frame{aspect-ratio:3/3.4;min-height:440px;max-height:500px;width:92%;max-width:420px;margin:0 auto}.dossier-frame img{width:92%;max-width:420px;max-height:480px;aspect-ratio:3/3.4}}
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
/* Prose — elevated reading */
.prose{font-size:0.98rem;line-height:1.82;color:#1F1F1F;max-width:68ch;font-kerning:normal;font-variant-ligatures:common-ligatures;font-feature-settings:"kern" 1, "liga" 1, "calt" 1, "onum" 1;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.prose h1{font-family:var(--serif);font-size:1.85rem;line-height:1.1;letter-spacing:-0.02em;margin:1.8rem 0 0.7rem;font-weight:400}
.prose h2{font-family:var(--serif);font-size:1.32rem;line-height:1.3;letter-spacing:-0.01em;margin:1.7rem 0 0.6rem;padding-bottom:0.4rem;border-bottom:1px solid var(--line);font-weight:400}
.prose h3{font-family:var(--serif);font-size:1.05rem;margin:1.4rem 0 0.5rem;font-weight:600}
.prose p{margin:1.05rem 0;line-height:1.9;letter-spacing:0.012em;word-spacing:0.03em;hyphens:auto;hyphenate-limit-chars:6 3 2;widows:2;orphans:2;text-wrap:pretty}
.prose blockquote{border-left:3px solid #24486A;margin:1.3rem 0;padding:0.9rem 1.1rem;background:var(--paper-2);border-radius:0 0.6rem 0.6rem 0;font-style:italic;color:#2B2B2B;box-shadow:0 1px 6px rgba(11,11,11,0.04)}
.prose ul{margin:0.9rem 0;padding-left:1.2rem;list-style:none}
.prose ul li{position:relative;padding-left:0.9rem;margin:0.55rem 0;line-height:1.75}
.prose ul li::before{content:"—";position:absolute;left:0;color:#24486A;font-weight:700}
.prose code{background:var(--paper-2);border:1px solid var(--line);padding:0.16rem 0.38rem;border-radius:0.35rem;font-size:0.82rem;font-family:var(--mono)}
.prose a{color:#24486A;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(36,72,106,0.3)}
.prose a:hover{color:#24486A;text-decoration-color:#24486A}
/* Author's words — justified, kerned, elevated */
.authors-words{margin:1rem 0 1.6rem;padding:1.15rem 1.25rem;background:var(--paper-2);border-left:3px solid var(--line-strong);border-radius:0 0.7rem 0.7rem 0}
.authors-words p{font-family:'Newsreader', Georgia, serif;text-align:justify;text-justify:inter-word;font-size:1.06rem;font-weight:300;line-height:1.92;letter-spacing:0.015em;word-spacing:0.04em;color:#1A1A1A;hyphens:auto;hyphenate-limit-chars:6 3 2;margin:1rem 0;widows:3;orphans:3;text-wrap:pretty;font-kerning:normal;font-variant-ligatures:common-ligatures;font-feature-settings:"kern" 1, "liga" 1, "onum" 1}
.authors-words p:first-of-type::first-letter{font-family:var(--serif);font-size:2.7em;float:left;line-height:0.78;margin:0.06em 0.14em 0 0;font-weight:400;color:var(--ink)}
.authors-words p:last-child{margin-bottom:0}
@media(max-width:640px){
  .authors-words{padding:0.95rem 1rem}
  .authors-words p{font-size:1.02rem;line-height:1.85;letter-spacing:0.01em}
}
/* Summary — same elevated kerning/justified treatment */
.summary-words{margin:1rem 0 1.6rem;padding:1.1rem 1.2rem;background:#FFFFFF;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:0 0.7rem 0.7rem 0}
.summary-words p{font-family:'Newsreader', Georgia, serif;text-align:justify;text-justify:inter-word;font-size:1.05rem;font-weight:300;line-height:1.9;letter-spacing:0.014em;word-spacing:0.038em;color:#1E1E1E;hyphens:auto;hyphenate-limit-chars:6 3 2;margin:0.9rem 0;widows:3;orphans:3;text-wrap:pretty;font-kerning:normal;font-variant-ligatures:common-ligatures;font-feature-settings:"kern" 1, "liga" 1, "onum" 1}
.summary-words p:last-child{margin-bottom:0}
@media(max-width:640px){
  .summary-words{padding:0.95rem 1rem}
  .summary-words p{font-size:1.01rem;line-height:1.84;letter-spacing:0.01em}
}
/* Differing thoughts — same elevated kerning/justified treatment */
.differing-words{margin:1rem 0 1.6rem;padding:1.1rem 1.2rem;background:var(--paper);border:1px solid var(--line);border-left:3px solid #8B5E34;border-radius:0 0.7rem 0.7rem 0}
.differing-words p{font-family:'Newsreader', Georgia, serif;text-align:justify;text-justify:inter-word;font-size:1.05rem;font-weight:300;line-height:1.9;letter-spacing:0.014em;word-spacing:0.038em;color:#1E1E1E;hyphens:auto;hyphenate-limit-chars:6 3 2;margin:0.9rem 0;widows:3;orphans:3;text-wrap:pretty;font-kerning:normal;font-variant-ligatures:common-ligatures;font-feature-settings:"kern" 1, "liga" 1, "onum" 1}
.differing-words p:last-child{margin-bottom:0}
@media(max-width:640px){
  .differing-words{padding:0.95rem 1rem}
  .differing-words p{font-size:1.01rem;line-height:1.84;letter-spacing:0.01em}
}
/* Key Quotes from Author — same elevated kerning, editorial quote treatment */
.quotes-words{margin:1rem 0 1.6rem;padding:1.1rem 1.2rem;background:var(--paper-2);border:1px solid var(--line);border-left:3px solid var(--ink);border-radius:0 0.7rem 0.7rem 0}
.quotes-words ul{margin:0;padding:0;list-style:none}
.quotes-words li{font-family:'Newsreader', Georgia, serif;text-align:left;font-size:1.06rem;font-weight:300;font-style:italic;line-height:1.85;letter-spacing:0.014em;word-spacing:0.038em;color:#1A1A1A;hyphens:auto;hyphenate-limit-chars:6 3 2;margin:0.9rem 0;padding:0.7rem 1rem 0.7rem 1.1rem;background:var(--paper);border-left:3px solid var(--accent);border-radius:0 0.5rem 0.5rem 0;widows:3;orphans:3;text-wrap:pretty;font-kerning:normal;font-variant-ligatures:common-ligatures;font-feature-settings:"kern" 1, "liga" 1, "onum" 1}
.quotes-words li:first-child{margin-top:0}
.quotes-words li:last-child{margin-bottom:0}
.quotes-words li::before{display:none}
.quotes-words p{font-family:'Newsreader', Georgia, serif;text-align:justify;text-justify:inter-word;font-size:1.05rem;font-weight:300;line-height:1.9;letter-spacing:0.014em;word-spacing:0.038em;color:#1E1E1E;hyphens:auto;margin:0.9rem 0;text-wrap:pretty;font-kerning:normal}
@media(max-width:640px){
  .quotes-words{padding:0.95rem 1rem}
  .quotes-words li{font-size:1.02rem;line-height:1.8;letter-spacing:0.01em;padding:0.6rem 0.9rem 0.6rem 1rem}
}
.wrap{max-width:var(--max);margin:0 auto;padding:0 1.5rem}
.footer{border-top:none;margin-top:2.5rem;padding:1.4rem 1.5rem;text-align:center;color:#FFFFFF;background:#24486A;font-size:0.72rem}
.footer a{color:#FFFFFF;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(255,255,255,0.6)}
.footer a:hover{color:#FFFFFF;text-decoration-color:#FFFFFF}
/* --- Mobile-first 100% width overrides --- */
img{max-width:100%;height:auto;display:block}
.hero-img{width:100%;max-width:420px;height:auto;max-height:520px;object-fit:cover;object-position:35% 18%;clip-path:polygon(12% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 12%);filter:drop-shadow(0 16px 24px rgba(11,11,11,0.08))}
.service-grid{margin-top:1rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:0.65rem}
@media(max-width:640px){
  html,body{overflow-x:hidden}
  .topbar-inner{padding:0.7rem 1rem}
  .mark-sub{font-size:0.52rem;letter-spacing:0.1em}
  .hero{padding:1.2rem 1rem 0.8rem !important}
  .hero-grid{grid-template-columns:1fr !important;gap:1rem !important;padding:0 !important}
  .hero-grid > div{width:100%}
  .hero-img{width:100% !important;max-width:100% !important;max-height:none !important;aspect-ratio:auto !important}
  .display{text-align:left !important;width:100%}
  .display h1{font-size:clamp(2.4rem,9vw,3.2rem) !important}
  .display div[style*="justify-content:flex-end"]{justify-content:flex-start !important}
  .wrap{max-width:100% !important;padding-left:1rem !important;padding-right:1rem !important;margin-left:auto !important;margin-right:auto !important;width:100% !important;box-sizing:border-box}
  .section{padding:1.2rem 1rem !important}
  .manifesto{padding:1.5rem 1rem !important}
  .prose{max-width:100% !important;width:100% !important}
  .prose img{width:100% !important}
  .icon-projects,.case{width:100%}
  .service-grid{grid-template-columns:1fr !important}
  .index-grid{grid-template-columns:1fr !important;gap:0.8rem}
  .index-card{grid-column:span 12 !important;width:100%}
  .case{grid-template-columns:1fr !important}
  .footer{padding:1.2rem 1rem}
}
@media(min-width:641px) and (max-width:900px){
  .hero{padding:1.6rem 1rem 1rem}
  .hero-grid{grid-template-columns:1fr !important;gap:1.2rem !important;padding:0 !important}
  .hero-img{width:100% !important;max-width:520px !important;margin:0 auto;display:block}
  .display{text-align:left !important}
  .display div[style*="justify-content:flex-end"]{justify-content:flex-start !important}
  .wrap{padding-left:1rem !important;padding-right:1rem !important}
}
@media(min-width:901px){
  .hero-img{width:92%;max-width:420px}
}
</style>
</head>
<body>
<header class="topbar"><div class="topbar-inner"><a class="mark" href="${esc(homeHref)}"><span class="mark-badge">PU</span><span><span class="mark-name">Peter Ugwuoke</span><span class="mark-sub">Due Diligence | Data Privacy | Compliance | Cybersecurity | AI</span></span></a><nav class="nav" style="position:relative"><div class="consult-desktop" style="text-align:right;line-height:1.3"><div style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--ink)">Consult</div><div style="font-size:0.68rem;color:var(--ink);margin-top:0.15rem;text-transform:none">peterugwuokeify@gmail.com<br/>+2349076117035</div></div><button class="consult-toggle" aria-expanded="false" aria-controls="consult-panel" type="button">Consult</button><div id="consult-panel" class="consult-panel" hidden><div style="font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--ink)">Consult</div><div style="font-size:0.68rem;color:var(--ink);margin-top:0.4rem;line-height:1.4">peterugwuokeify@gmail.com<br/>+2349076117035</div></div></nav></div></header>
${bodyHtml}
<footer class="footer"><div style="max-width:var(--max);margin:0 auto"><a href="${esc(homeHref)}" style="text-decoration:none;color:inherit">© ${new Date().getFullYear()} Peter Ugwuoke • Africa/Lagos</a><div style="margin-top:0.7rem;display:flex;gap:0.9rem;justify-content:center;flex-wrap:wrap;font-size:0.72rem"><a href="https://www.linkedin.com/in/peterugwuoke" target="_blank" rel="noopener" aria-label="LinkedIn" style="color:#FFFFFF;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(255,255,255,0.6)">LinkedIn</a><a href="https://www.facebook.com/sirp4change/" target="_blank" rel="noopener" aria-label="Facebook" style="color:#FFFFFF;text-decoration:underline;text-underline-offset:3px">Facebook</a><a href="https://www.facebook.com/profile.php?id=61593746679286" target="_blank" rel="noopener" style="color:#FFFFFF;text-decoration:underline;text-underline-offset:3px">NaijaPrivacyGuide</a><a href="https://www.biblecounselor.com.ng" target="_blank" rel="noopener" style="color:#FFFFFF">BibleCounsel</a><a href="https://www.shop.highfiveltd.com" target="_blank" rel="noopener" style="color:#FFFFFF">Shop HighFive</a><a href="${esc(gleaningsHref)}" style="color:#FFFFFF">Gleanings</a></div></div></footer>
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
      if(/^sirP_main\.(jpe?g|png|webp|avif)$/i.test(f) || /^sir_p_main\.(png|jpe?g)$/i.test(f) || /^favicon.*\.(png|ico)$/i.test(f) || /^apple-touch-icon\.png$/i.test(f)){
        const dest = f==='favicon.ico' ? path.join(outDir,f) : path.join(outImagesDir,f);
        fs.copyFileSync(path.join(srcImagesDir,f), dest);
        // alias for sirP vs sir_p
        if(f.toLowerCase()==="sirp_main.jpeg"){
          const alt=path.join(outImagesDir,"sirP_main.jpg");
          if(!fs.existsSync(alt)) fs.copyFileSync(path.join(srcImagesDir,f),alt);
        }
        if(f.toLowerCase()==="sirp_main.jpg"){
          const alt=path.join(outImagesDir,"sirP_main.jpeg");
          if(!fs.existsSync(alt)) fs.copyFileSync(path.join(srcImagesDir,f),alt);
        }
        if(f==='sir_p_main.png'){
          const alt2=path.join(outImagesDir,'sirP_main.png');
          if(!fs.existsSync(alt2)) fs.copyFileSync(path.join(srcImagesDir,f),alt2);
        }
        // also ensure favicon.ico at root
        if(f==='favicon.png'){
          const icoSrc=path.join(srcImagesDir,'favicon.ico');
          if(fs.existsSync(icoSrc)) fs.copyFileSync(icoSrc, path.join(outDir,'favicon.ico'));
        }
      }
    }
    // ensure favicon.ico at dist root even if not in loop
    const favIcoSrc=path.join(srcImagesDir,'favicon.ico');
    if(fs.existsSync(favIcoSrc)) fs.copyFileSync(favIcoSrc, path.join(outDir,'favicon.ico'));
  }
}catch(e){}
for(const it of items){const cleaned=cleanBody(it.body);const rawHtml=mdToHtml(cleaned);let htmlBody=enhanceAuthorsWords(rawHtml);htmlBody=enhanceSummary(htmlBody);htmlBody=enhanceDifferingThoughts(htmlBody);htmlBody=enhanceKeyQuotes(htmlBody);const speakerBtn=it.speakerUrl ? `<a href="${esc(it.speakerUrl)}" target="_blank" rel="noopener" style="font-size:0.68rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;border:1px solid var(--ink);padding:0.38rem 0.75rem;border-radius:999px;background:var(--ink);color:var(--paper);text-decoration:none">Speaker: ${esc(it.speaker)}${it.handle?' @'+esc(it.handle):''} ↗</a>` : `<span style="font-size:0.68rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;border:1px solid var(--line);padding:0.38rem 0.75rem;border-radius:999px;background:var(--paper-2)">${esc(it.speaker)}</span>`;const sourceBtn=it.source ? `<a href="${esc(it.source)}" target="_blank" rel="noopener" style="font-size:0.68rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;border:1px solid var(--line);padding:0.38rem 0.75rem;border-radius:999px;background:var(--paper);text-decoration:none">View source ↗</a>` : ``;const metaLine=`<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.9rem;align-items:center">${speakerBtn}${sourceBtn}${it.likes?`<span style="font-size:0.68rem;color:var(--muted);border:1px solid var(--line);padding:0.38rem 0.65rem;border-radius:999px;background:var(--paper)">♥ ${esc(it.likes)} likes</span>`:''}${it.plays?`<span style="font-size:0.68rem;color:var(--muted);border:1px solid var(--line);padding:0.38rem 0.65rem;border-radius:999px;background:var(--paper)">${esc(it.plays)} plays</span>`:''}</div>`;const breadcrumb=`<div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:0.9rem;font-weight:600"><a href="../../../index.html" style="color:var(--muted);text-decoration:none">Home</a> <span style="opacity:0.4">/</span> <a href="../../../index.html#cases" style="color:var(--muted)">Projects</a> <span style="opacity:0.4">/</span> <a href="index.html" style="color:var(--muted)">Gleanings</a> <span style="opacity:0.4">/</span> <span style="color:var(--ink)">${esc(it.category)}</span></div>`;const pageInner=`<div class="wrap" style="max-width:800px;margin:1.8rem auto"><div style="background:var(--paper);border:1px solid var(--line-strong);padding:1.2rem 1.2rem 1rem"><div class="kicker">${esc(it.category)} • ${esc(it.speaker)}</div><h1 style="font-family:var(--serif);font-size:2.15rem;line-height:0.98;letter-spacing:-0.02em;margin:0.6rem 0 0;font-weight:400">${esc(it.title)}</h1>${metaLine}</div><div style="background:var(--paper);border:1px solid var(--line);border-top:none;padding:1.4rem 1.3rem" class="prose">${htmlBody}</div><div style="margin-top:1.1rem;display:flex;gap:0.6rem;flex-wrap:wrap"><a href="index.html" style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;border-bottom:1px solid var(--ink);padding-bottom:0.15rem;text-decoration:none">← Back to Gleanings</a><span style="opacity:0.3">•</span><a href="../../../index.html" style="font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:var(--muted);text-decoration:none">Home</a></div></div>`;const page=brandShell({title:`${it.title} — Gleanings`,description:it.excerpt.slice(0,150),bodyHtml:pageInner,homeHref:"../../../index.html",gleaningsHref:"index.html",casesHref:"../../../index.html#cases"});fs.writeFileSync(path.join(outGleaningsDir,`${it.slug}.html`),page);fs.writeFileSync(path.join(outVideosDir,`${it.slug}.html`),page);}
let gleaningsInner=`<div class="wrap" style="max-width:1240px;margin:1.2rem auto"><div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:600"><a href="../../../index.html" style="color:var(--muted);text-decoration:none">Home</a> <span style="opacity:0.4">/</span> <a href="../../../index.html#cases" style="color:var(--muted)">Projects</a> <span style="opacity:0.4">/</span> <a href="index.html" style="color:var(--muted)">Gleanings</a> <span style="opacity:0.4">/</span> Insights</div>`;
if(items.length===0){gleaningsInner+=`<div style="border:1px solid var(--line);padding:1.5rem;text-align:center;color:var(--muted)">No gleanings yet</div>`;}else{for(const [speaker,byCat] of [...bySpeaker.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){gleaningsInner+=`<h2 style="font-family:var(--serif);font-size:1.2rem;margin:1.4rem 0 0.6rem;border-top:1px solid var(--line);padding-top:0.8rem">${esc(speaker)}</h2>`;for(const [cat,vids] of [...byCat.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){gleaningsInner+=`<div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:0.8rem 0 0.6rem">${esc(cat)} • ${vids.length}</div><div class="index-grid">`;for(const v of vids){gleaningsInner+=`<a class="index-card" href="${esc(v.slug)}.html"><div class="eyebrow" style="font-size:0.58rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(cat)}</div><h4>${esc(v.title)}</h4><p>${esc(v.excerpt).slice(0,130)}</p><div class="foot"><span>${esc(v.speaker)}</span><span>→</span></div></a>`;}gleaningsInner+=`</div>`;}}
}gleaningsInner+=`</div>`;const gleaningsPage=brandShell({title:"Gleanings — Insights",description:`Video wisdom distilled — ${items.length} insights`,bodyHtml:gleaningsInner,homeHref:"../../../index.html",gleaningsHref:"index.html",casesHref:"../../../index.html#cases"});fs.writeFileSync(path.join(outGleaningsDir,"index.html"),gleaningsPage);
const scriptureInner=`<div class="wrap" style="max-width:760px;margin:2rem auto;text-align:center"><div class="kicker">Projects / ScriptureGuide</div><h1 style="font-family:var(--serif);font-size:2.2rem;margin:0.4rem 0">ScriptureGuide</h1><p style="color:var(--muted);font-size:0.95rem;max-width:34rem;margin:0.5rem auto">Biblical counsel for everyday life — curated Scripture, plain-language guidance. Hosted at <strong style="color:var(--ink)">biblecounselor.com.ng</strong>.</p><p style="margin:1.2rem 0;display:flex;gap:0.6rem;justify-content:center"><a class="btn btn-primary" href="https://biblecounselor.com.ng" target="_blank" rel="noopener">Open biblecounselor.com.ng ↗</a><a class="btn btn-ghost" href="../../index.html">Back</a></p><p style="font-size:0.72rem;color:var(--muted);margin-top:1rem">Alias: <code>projects/ScriptureGuide</code> → external. Redirects in 1.5s.</p></div><script>setTimeout(()=>location.href="https://biblecounselor.com.ng",1500)</script>`;const scripturePage=brandShell({title:"ScriptureGuide — biblecounselor.com.ng",description:"ScriptureGuide — biblical counsel at biblecounselor.com.ng",bodyHtml:scriptureInner,homeHref:"../../index.html",gleaningsHref:"../gleanings/insights/index.html",casesHref:"../../index.html#cases"});fs.writeFileSync(path.join(outScriptureDir,"index.html"),scripturePage);
const cases=[
{num:"01",title:"Work",subtitle:"LinkedIn",desc:"Professional history, roles and selected work — connect and see experience.",meta:"linkedin.com/in/peterugwuoke ↗",href:"https://www.linkedin.com/in/peterugwuoke",cta:"View LinkedIn",external:true,icon:"◎",img:"",kicker:"Profile"},
{num:"02",title:"NaijaPrivacyGuide",subtitle:"Data privacy",desc:"Nigeria data-privacy guide — practical explainers, rights and compliance notes for everyone.",meta:"Facebook — NaijaPrivacyGuide ↗",href:"https://www.facebook.com/profile.php?id=61593746679286",cta:"Visit page",external:true,icon:"◉",img:"",kicker:"Guide"},
{num:"03",title:"BibleCounsel",subtitle:"Scripture guide",desc:"Curated biblical counsel for real-life scenarios — plain-language guidance. Pastoral tool, Scripture first.",meta:"www.biblecounselor.com.ng ↗",href:"https://www.biblecounselor.com.ng",cta:"Visit site",external:true,icon:"✦",img:"",kicker:"Project"},
{num:"04",title:"Shop HighFive",subtitle:"E-commerce",desc:"Custom apparel, printing and fashion accessory store.",meta:"www.shop.highfiveltd.com ↗",href:"https://www.shop.highfiveltd.com",cta:"Visit shop",external:true,icon:"⬡",img:"",kicker:"Store"},
{num:"05",title:"Gleanings",subtitle:"Video wisdom",desc:"My personal reflections and insights from resources I find interesting online",meta:`${items.length} insights • ${bySpeaker.size} speakers`,href:"projects/gleanings/insights/index.html",cta:"Open Gleanings",icon:"◐",img:"",kicker:"Archive"},
{num:"06",title:"Socials",subtitle:"Facebook",desc:"Connect with me — follow along.",meta:"facebook.com/sirp4change ↗",href:"https://www.facebook.com/sirp4change/",cta:"Follow",external:true,icon:"○",img:"",kicker:"Community"}
];
let homeInner=`
<div class="hero" style="padding-bottom:0.8rem">
  <div class="hero-grid">
    <div style="display:flex;justify-content:center;align-items:center;width:100%">
      <img class="hero-img" src="images/sir_p_main.png" alt="Peter Ugwuoke — portrait" onerror="this.src='images/sirP_main.png'"/>
    </div>
    <div class="display" style="text-align:right"><h1>Securing <em>Trust,</em><br/>Scaling <em>Innovation.</em></h1><div style="margin-top:0.9rem;display:flex;justify-content:flex-end"><a href="#how-i-help" style="display:inline-flex;align-items:center;gap:0.5rem;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:0.75rem 1.4rem;border-radius:999px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);text-decoration:none">How I help ↓</a></div></div>
  </div>
</div>
<div id="how-i-help" style="max-width:var(--max);margin:0 auto;padding:1.6rem 1.5rem 0;scroll-margin-top:84px">
  <div style="border-top:1px solid var(--line-strong);padding-top:1.4rem">
    <h3 style="font-family:var(--serif);font-size:1.55rem;line-height:1.1;margin:0;font-weight:400;color:#FFFFFF;background:#24486A;padding:0.45rem 0.75rem;display:inline-block">I help businesses:</h3>
    <div class="service-grid">
      <div class="service-card"><div class="icon-box">◈</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Navigate highly complex and regulated Africa business environments by remaining compliant</div></div>
      <div class="service-card"><div class="icon-box">◎</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Scope and conduct comprehensive Due Diligence investigations in Africa</div></div>
      <div class="service-card"><div class="icon-box">⬢</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Install fraud prevention &amp; detection mechanisms</div></div>
      <div class="service-card"><div class="icon-box">⬣</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Conduct Corporate Records Search / Beneficiary Ownership Searches</div></div>
      <div class="service-card"><div class="icon-box">⬡</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Execute Top-Level Local &amp; International Screening Solutions</div></div>
      <div class="service-card"><div class="icon-box">⚖</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Access Cross-border criminal records Checks</div></div>
      <div class="service-card"><div class="icon-box">◉</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Perform Local-International PEP / Global watchlists Searches</div></div>
      <div class="service-card"><div class="icon-box">📰</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Conduct Comprensive Adverse Media Searches</div></div>
      <div class="service-card"><div class="icon-box">◎</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Carry out Financial Liability checks</div></div>
      <div class="service-card"><div class="icon-box">⬢</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Conduct Identity Reliability Checks</div></div>
      <div class="service-card"><div class="icon-box">⬢</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">Execute HUMINT • OSINT • SOCMINT</div></div>
      <div class="service-card"><div class="icon-box">◐</div><div style="font-size:0.84rem;line-height:1.45;color:#1A1A1A">with On-site Discreet / Non-Discreet investigations</div></div>
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
// Render static headers fallback — ensures CSP allows Umami even if dashboard/edge caches old render.yaml
try{
  const csp="default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://umami-postgresql-latest-8xgn.onrender.com; script-src 'self' 'unsafe-inline' https://umami-postgresql-latest-8xgn.onrender.com; connect-src 'self' https://umami-postgresql-latest-8xgn.onrender.com; frame-ancestors 'none'";
  fs.writeFileSync(path.join(outDir,"_headers"),`/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n`);
  fs.writeFileSync(path.join(outDir,"_redirects"),`# Netlify-style placeholder - no redirects\n`);
}catch(e){}
console.log(`Built ${items.length} videos → ${bySpeaker.size} speakers`);
console.log(`Output: ${outDir}/index.html (editorial) + ${outGleaningsDir}/index.html`);
}
build();
