#!/bin/bash
# Works both locally (/workspace) and on Render (/opt/render/project/src)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE_ROOT="${REPO_ROOT}/.cache"
if [ -d "/workspace/.cache" ]; then CACHE_ROOT="/workspace/.cache"; fi
export PATH="/workspace/.local/bin:$REPO_ROOT/node_modules/.bin:$PATH"
export HF_HOME="${CACHE_ROOT}/huggingface"
export XDG_CACHE_HOME="${CACHE_ROOT}"
export PIP_CACHE_DIR="${CACHE_ROOT}/pip"
export NPM_CONFIG_CACHE="${CACHE_ROOT}/npm"
# Ensure ffmpeg available (static binary, no apt libs needed)
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found, linking from static"
  mkdir -p /workspace/.local/bin 2>/dev/null || mkdir -p "${CACHE_ROOT}/bin"
  if [ -f "${REPO_ROOT}/node_modules/ffmpeg-static/ffmpeg" ]; then
    cp "${REPO_ROOT}/node_modules/ffmpeg-static/ffmpeg" /workspace/.local/bin/ffmpeg 2>/dev/null || cp "${REPO_ROOT}/node_modules/ffmpeg-static/ffmpeg" "${CACHE_ROOT}/bin/ffmpeg" 2>/dev/null || true
    chmod +x /workspace/.local/bin/ffmpeg 2>/dev/null || chmod +x "${CACHE_ROOT}/bin/ffmpeg" 2>/dev/null || true
  fi
fi
# Check whisper model cached
if [ ! -d "${HF_HOME}/hub/models--Systran--faster-whisper-base" ] && [ ! -d "/workspace/.cache/huggingface/hub/models--Systran--faster-whisper-base" ]; then
  echo "Whisper base model not cached, will download on first transcribe (150MB, cached after at ${HF_HOME})"
else
  echo "Whisper model cached at ${HF_HOME}"
fi
echo "Wisdom deps ready: ffmpeg=$(which ffmpeg) yt-dlp=$(which yt-dlp) HF_HOME=$HF_HOME"
