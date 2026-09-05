# Video Wisdom Site — Local Extraction, Static Publish

**Speaker → Category → Video wisdom.** Each video you extract locally becomes a beautiful static page hosted on Render (free).

## Flow (Separated as requested)

```
Local (private, heavy)                      GitHub → Render (cheap, static)
any URL/file → VideoWisdom (yt-dlp → ffmpeg → Whisper) → .md (8KB)
     ↓ --save
~/.claude/LIFEOS/USER/KNOWLEDGE/Research/VideoWisdom_*.md
     ↓ rsync (WatchAndPublish — debounced, lean only)
video-wisdom-site/content/videos/*.md  (transcripts ignored via .gitignore)
     ↓ npm run build (src/build-video-site.js)
dist/index.html (organized by speaker → category) + dist/videos/<slug>.html
     ↓ git commit + push
Render static site (CDN, never sleeps)
```

## Mitigations Implemented (your request)

| Con | Mitigation |
|-----|------------|
| **Commit bloat** (transcripts 3KB + md 8KB × 100s videos) | `.gitignore` ignores `*_transcript.txt`; only lean `.md` (insights, not raw transcript) is committed. Media (covers/thumbs) goes via LFS (`.gitattributes`). |
| **Large diffs** | Frontmatter + excerpt only in index; full body lives in per-video page. Builder is incremental — only changed `md` triggers rebuild. |
| **Manual publish friction** | `Tools/WatchAndPublish.js` daemon: watches `Research/` and auto `rsync → build → git add → commit → push` (debounced 3s). |
| **Speaker/category drift** | Builder infers `speaker` from `**Author:**` and `category` from title keywords; override via frontmatter `speaker:` / `category:` in md. |

## Usage

```bash
# 1. Extract locally (private, offline)
bun ~/.claude/skills/VideoWisdom/Tools/ExtractWisdom.ts --url "https://..." --depth 5 --save

# 2. Publish (auto or manual)
# auto-daemon:
node Tools/WatchAndPublish.js --watch
# or one-shot:
node Tools/WatchAndPublish.js --once
# or manual:
cp ~/.claude/LIFEOS/USER/KNOWLEDGE/Research/VideoWisdom_*.md ./content/videos/
npm run build

# 3. Preview
npx serve dist -p 3000

# 4. Deploy — push to GitHub, Render auto-deploys (env: static, buildCommand: npm run build)
git add content/videos/*.md
git commit -m "publish: 2 videos"
git push
```

## Content

- `content/videos/` — lean wisdom md (committed). Transcripts (`*_transcript.txt`) ignored.
- `src/build-video-site.js` — md → html, grouped by speaker → category.
- `Tools/WatchAndPublish.js` — `Research/` → `content/videos/` → build → commit → push.

## Render

`render.yaml` is pre-configured: `env: static`, `buildCommand: npm run build`, `staticPublishPath: dist`. Create repo `taken2coding/video-wisdom-site` on GitHub, connect to Render, done.

