/**
 * Publish web/dist into the gh-pages branch under demo/.
 *
 * Uses a temporary git worktree so the checked-out branch is never disturbed,
 * and STAGES A COMMIT WITHOUT PUSHING unless `--push` is passed -- gh-pages is a
 * live public site, so the last step stays a deliberate act. Run with `--dry-run`
 * to see what would change and touch nothing.
 *
 * Usage:
 *   node tools/deploy_ghpages.mjs --dry-run
 *   node tools/deploy_ghpages.mjs            # commit to gh-pages locally
 *   node tools/deploy_ghpages.mjs --push     # commit and push
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, mkdtempSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
const REPO = resolve(WEB, '..');
const DIST = resolve(WEB, 'dist');
const SUBDIR = 'demo';
const BRANCH = 'gh-pages';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const PUSH = argv.includes('--push');

const git = (args, cwd = REPO) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

if (!existsSync(DIST)) {
  console.error('web/dist does not exist. Run `npm run build` first.');
  process.exit(1);
}

const totalBytes = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce((sum, e) => {
    const p = join(dir, e.name);
    return sum + (e.isDirectory() ? totalBytes(p) : statSync(p).size);
  }, 0);

console.log(`dist: ${(totalBytes(DIST) / 1e6).toFixed(1)} MB -> ${BRANCH}:${SUBDIR}/`);

const work = mkdtempSync(join(tmpdir(), 'ghpages-'));
let added = false;
try {
  git(['worktree', 'add', '--quiet', work, BRANCH]);
  added = true;

  const target = join(work, SUBDIR);
  rmSync(target, { recursive: true, force: true });
  cpSync(DIST, target, { recursive: true });

  const status = git(['status', '--porcelain'], work);
  if (!status) {
    console.log('gh-pages already matches this build; nothing to do.');
  } else {
    console.log(`\nchanges:\n${status
      .split('\n')
      .slice(0, 40)
      .map((l) => `  ${l}`)
      .join('\n')}`);
    const n = status.split('\n').length;
    if (n > 40) console.log(`  ... and ${n - 40} more`);

    if (DRY) {
      console.log('\n--dry-run: not committing.');
    } else {
      git(['add', '--all', SUBDIR], work);
      git(['commit', '--quiet', '-m', `demo: update browser dodgeball demo`], work);
      console.log(`\ncommitted to ${BRANCH}.`);
      if (PUSH) {
        git(['push', 'origin', BRANCH], work);
        console.log('pushed. Live shortly at:');
        console.log('  https://lzyang2000.github.io/perceptive_cbf_rl/demo/');
      } else {
        console.log('NOT pushed. To publish:');
        console.log(`  git push origin ${BRANCH}`);
      }
    }
  }
} finally {
  if (added) {
    try {
      git(['worktree', 'remove', '--force', work]);
    } catch {
      console.warn(`could not remove worktree ${work}; remove it manually.`);
    }
  }
  rmSync(work, { recursive: true, force: true });
}
