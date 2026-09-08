# VideoWisdom Agent — Persistent Setup (read this in new sessions)

If I forget how we built the VideoWisdom extractor, point me to **this file**: `video-wisdom-site/AGENT_SETUP.md` (`src/build-video-site.js:1`, `Tools/ensure-deps.sh:1`).

## What the agent does
- Ingest any TikTok/YouTube/FB/IG URL or local file → `tikwm` API (TikTok) → `curl` video → `ffmpeg` extract 16kHz wav → `faster-whisper base` (cpu int8) transcribe → Fabric `extract_wisdom` → `content/videos/VideoWisdom_<id>.md` → `bun src/build-video-site.js` → `dist/projects/gleanings/insights/<slug>.html` with elevated kerning (`authors-words` `letter-spacing:0.015em`).

## Dependencies that must be cached (not re-downloaded)
- **ffmpeg 7.1.5 static** — via `package.json:6` `ffmpeg-static@5.3.0` → `node_modules/ffmpeg-static/ffmpeg` (77M) → copied to `/workspace/.local/bin/ffmpeg` for `Tools/ExtractWisdom.ts:58` fallback. **Do NOT `apt-get install ffmpeg` again** — use static.
- **yt-dlp 2026.08.19** — `pip install --break-system-packages yt-dlp --cache-dir ./.cache/pip` (or `/workspace/.cache/pip`). Binary at `/workspace/.local/bin/yt-dlp` (copied from `/usr/local/bin/yt-dlp`).
- **faster-whisper 1.2.1 + ctranslate2** — `pip install --break-system-packages faster-whisper --cache-dir ./.cache/pip`. Model `Systran/faster-whisper-base` (~150MB) cached at `HF_HOME=./.cache/huggingface` (was `/root/.cache/huggingface/hub`, now copied to `/workspace/.cache/huggingface/hub` and `/.cache/huggingface`). **Never re-download** — set `HF_HOME=/workspace/.cache/huggingface` and `XDG_CACHE_HOME=/workspace/.cache`.

## Where cache lives (persistent volume)
- `/workspace/.cache/pip` — pip wheels
- `/workspace/.cache/npm` / `./.cache/npm` — npm/bun
- `/workspace/.cache/huggingface` + `./.cache/huggingface` — whisper base model
- `/workspace/.local/bin/ffmpeg` + `/workspace/.local/bin/yt-dlp` — static binaries
- `video-wisdom-site/.cache/` — repo-relative cache (Render writable, `/workspace` is read-only on Render)

All are inside `/workspace` volume which survives new sessions. Dist is `.gitignore`'d but rebuilt via `package.json`.

## One-line restore in a new session
```bash
source Tools/ensure-deps.sh  # sets PATH, HF_HOME, PIP_CACHE_DIR, restores ffmpeg from node_modules if missing
# then:
bun /workspace/.claude/skills/VideoWisdom/Tools/ExtractWisdom.ts --url "https://www.tiktok.com/@h_miller76/video/<id>" --depth 3 --verbose
# or manual tikwm path (faster, avoids yt-dlp JS challenge):
# curl -s "https://www.tikwm.com/api/?url=https://www.tiktok.com/@h_miller76/video/<id>" | python3 -m json.tool
# curl -L -o /tmp/<id>.mp4 "<play_url>" -H "Referer: https://www.tiktok.com/" -A "Mozilla/5.0"
# /workspace/.local/bin/ffmpeg -y -i /tmp/<id>.mp4 -vn -ar 16000 -ac 1 -c:a pcm_s16le /tmp/<id>.wav
# HF_HOME=/workspace/.cache/huggingface python3 -c "from faster_whisper import WhisperModel; m=WhisperModel('base',device='cpu',compute_type='int8'); segs,_=m.transcribe('/tmp/<id>.wav'); print(''.join(s.text for s in segs))"
```

## Render build (no re-download)
`render.yaml:6` is now:
```
buildCommand: pip install -q --break-system-packages faster-whisper yt-dlp --cache-dir ./.cache/pip && (npm install --cache ./.cache/npm 2>/dev/null || bun install) && (npm run build 2>/dev/null || bun run build)
```
- Uses `--break-system-packages` (PEP 668) and `./.cache` (writable on Render, not `/workspace`).
- `bun.lock` deleted and ignored (`.gitignore:1` `bun.lock`) to avoid `Unknown lockfile version` on older Render bun.

## Current site state (as of 2026-09-08)
- 45 videos → 2 speakers (Delphi 28, Harry 11, Derek 5) + title-slugs like `the-past-happens-every-day-232607.html` with 301 redirects from old `VideoWisdom_*.html` (`src/build-video-site.js:15` `slugify(title)+'-'+id.slice(-6)`).
- CSP allows Umami: `render.yaml:11` + `src/build-video-site.js:182` `<script defer src="https://umami-postgresql-latest-8xgn.onrender.com/script.js" data-website-id="c254ecd5-...">`
- Keepalive: `Apps Script keepUmamiAwake()` every 10min (GitHub `.github/workflows/keepalive.yml` deleted, now direct ping).

## If I forget, do:
1. `cat video-wisdom-site/AGENT_SETUP.md` (this file)
2. `source video-wisdom-site/Tools/ensure-deps.sh && echo $HF_HOME && which ffmpeg && which yt-dlp`
3. Then extract as above — should be ~20s, not 5min.
