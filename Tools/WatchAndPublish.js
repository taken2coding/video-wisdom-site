// WatchAndPublish — local daemon that syncs VideoWisdom md → content/videos → build → commit → push
// Mitigations: only lean .md (not _transcript.txt), debounced build, incremental git add
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(__dirname, "..");
const sourceDir = path.join(process.env.HOME || "/root", ".claude/LIFEOS/USER/KNOWLEDGE/Research");
const destDir = path.join(siteRoot, "content/videos");

function run(cmd, args, opts={}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: siteRoot, ...opts });
  return r.status === 0;
}

function syncOnce() {
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(sourceDir)) { console.log(`Source not found: ${sourceDir}`); return; }
  const files = fs.readdirSync(sourceDir).filter(f => f.startsWith("VideoWisdom_") && f.endsWith(".md") && !f.includes("_transcript"));
  let added = 0;
  for (const f of files) {
    const src = path.join(sourceDir, f);
    const dest = path.join(destDir, f);
    // Avoid commit bloat: only copy if new or changed (compare hash)
    const srcBuf = fs.readFileSync(src);
    let needCopy = true;
    if (fs.existsSync(dest)) {
      const destBuf = fs.readFileSync(dest);
      needCopy = !srcBuf.equals(destBuf);
    }
    if (needCopy) {
      fs.copyFileSync(src, dest);
      added++;
    }
  }
  if (added === 0) { console.log("No new videos to publish"); return false; }
  console.log(`Synced ${added} new/changed md → ${destDir}`);

  // Build
  if (!run("node", ["src/build-video-site.js"])) { console.error("Build failed"); return false; }

  // Git add lean only (transcripts ignored via .gitignore)
  run("git", ["add", "content/videos/*.md", "dist/"]);
  // Check if anything to commit
  const diff = spawnSync("git", ["diff", "--cached", "--name-only"], { encoding: "utf8" });
  if (!diff.stdout.trim()) { console.log("Nothing to commit"); return false; }
  console.log("Changes:\n" + diff.stdout);
  const msg = `chore: publish ${added} video wisdom — ${new Date().toISOString().slice(0,10)}`;
  if (!run("git", ["commit", "-m", msg])) return false;
  console.log("Committed:", msg);
  // Push if origin exists
  const hasOrigin = spawnSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).status === 0;
  if (hasOrigin) {
    console.log("Pushing to origin...");
    run("git", ["push"]);
  } else {
    console.log("No origin — skipping push (add git remote to auto-publish to Render)");
  }
  return true;
}

// CLI: --once or --watch
const once = process.argv.includes("--once");
const watch = process.argv.includes("--watch");

if (once) {
  syncOnce();
} else if (watch) {
  console.log(`Watching ${sourceDir} → ${destDir} (debounced 3s)`);
  let timer = null;
  const debounce = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => syncOnce(), 3000);
  };
  // Initial sync
  syncOnce();
  // Watch source dir
  fs.watch(sourceDir, { recursive: false }, (event, file) => {
    if (file && file.startsWith("VideoWisdom_") && file.endsWith(".md")) debounce();
  });
  // Watch dest dir for manual edits
  if (fs.existsSync(destDir)) {
    fs.watch(destDir, { recursive: false }, debounce);
  }
  console.log("Watching... Ctrl+C to stop");
} else {
  // Default: once
  syncOnce();
  console.log("\nUsage: node Tools/WatchAndPublish.js --once | --watch");
}
