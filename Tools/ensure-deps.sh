#!/bin/bash
export PATH="/workspace/.local/bin:$PATH"
export HF_HOME=/workspace/.cache/huggingface
export XDG_CACHE_HOME=/workspace/.cache
export PIP_CACHE_DIR=/workspace/.cache/pip
export NPM_CONFIG_CACHE=/workspace/.cache/npm
# Ensure ffmpeg available
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found, linking from static"
  mkdir -p /workspace/.local/bin
  cp /workspace/video-wisdom-site/node_modules/ffmpeg-static/ffmpeg /workspace/.local/bin/ffmpeg 2>/dev/null || true
  chmod +x /workspace/.local/bin/ffmpeg 2>/dev/null || true
fi
# Check whisper model cached
if [ ! -d "/workspace/.cache/huggingface/hub/models--Systran--faster-whisper-base" ]; then
  echo "Whisper base model not cached, will download on first transcribe (150MB, cached after)"
else
  echo "Whisper model cached at /workspace/.cache/huggingface"
fi
echo "Wisdom deps ready: ffmpeg=$(which ffmpeg) yt-dlp=$(which yt-dlp) HF_HOME=$HF_HOME"
