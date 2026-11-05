#!/usr/bin/env node
/**
 * 梨花误 · 制片质检
 * 校验 drama-skills 产出的 分镜.md / 视频提示词.md / 视觉设定.md。
 * 纯 Node，无外部依赖。
 *
 * 用法：
 *   node qc.mjs <项目根> [剧集目录，如 剧集/EP001]
 *   node qc.mjs <项目根> --json
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const positional = args.filter((a) => !a.startsWith('--'));
const root = path.resolve(positional[0] || process.cwd());

function die(msg) {
  console.error(`无法继续：${msg}`);
  process.exit(2);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function pickEpisodeDir() {
  if (positional[1]) return path.join(root, positional[1]);
  const base = path.join(root, '剧集');
  if (!fs.existsSync(base)) die(`找不到 ${base}`);
  const first = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()[0];
  if (!first) die(`${base} 下没有剧集目录`);
  return path.join(base, first);
}

const episodeDir = pickEpisodeDir();
const files = {
  board: path.join(episodeDir, '分镜.md'),
  motion: path.join(episodeDir, '视频提示词.md'),
  visual: path.join(episodeDir, '视觉设定.md'),
};
for (const [k, f] of Object.entries(files)) {
  if (!fs.existsSync(f)) die(`缺少 ${k}：${f}`);
}

const board = read(files.board);
const motionText = read(files.motion);
const visual = read(files.visual);

const findings = [];
function check(id, ok, detail, level) {
  findings.push({ id, ok, detail, level: level || (ok ? 'pass' : 'fail') });
}

// ---------- 解析分镜 ----------
function splitSections(text, prefix) {
  const re = new RegExp(`^## (${prefix}-[A-Za-z0-9-]+)[^\\n]*$`, 'gm');
  const marks = [];
  let m;
  while ((m = re.exec(text)) !== null) marks.push({ id: m[1], start: m.index });
  return marks.map((mark, i) => ({
    id: mark.id,
    body: text.slice(mark.start, i + 1 < marks.length ? marks[i + 1].start : text.length),
  }));
}

const shots = splitSections(board, 'SHOT').map((s) => {
  const d = s.body.match(/^- 时长[：:]\s*(\d+(?:\.\d+)?)\s*s/m);
  return { id: s.id, duration: d ? Number(d[1]) : null, body: s.body };
});

const motions = splitSections(motionText, 'MOTION').map((s) => {
  const d = s.body.match(/^- 时长[：:]\s*(\d+(?:\.\d+)?)\s*s/m);
  const shot = s.body.match(/^- 分镜[：:]\s*(SHOT-[A-Za-z0-9-]+)/m);
  return { id: s.id, duration: d ? Number(d[1]) : null, shotId: shot ? shot[1] : null, body: s.body };
});

check('S1 分镜存在', shots.length > 0, `解析到 ${shots.length} 个 SHOT`);
check('S2 视频提示词存在', motions.length > 0, `解析到 ${motions.length} 个 MOTION`);

// S3 镜数一致
check(
  'S3 分镜与 MOTION 一一对应',
  shots.length === motions.length,
  `SHOT ${shots.length} 条 / MOTION ${motions.length} 条`
);

// S4 每镜时长在 H3 4–15 秒整数区间
const badDuration = shots.filter((s) => !Number.isInteger(s.duration) || s.duration < 4 || s.duration > 15);
check(
  'S4 单镜时长 4–15 秒整数',
  badDuration.length === 0,
  badDuration.length ? badDuration.map((s) => `${s.id}=${s.duration}s`).join(', ') : '全部合规'
);

// S5 总时长 60–90 秒
const total = shots.reduce((sum, s) => sum + (s.duration || 0), 0);
check('S5 总时长 60–90 秒', total >= 60 && total <= 90, `合计 ${total}s`);

// S6 每个 MOTION 都指向存在的 SHOT
const shotIds = new Set(shots.map((s) => s.id));
const orphan = motions.filter((m) => !m.shotId || !shotIds.has(m.shotId));
check(
  'S6 MOTION 引用的分镜存在',
  orphan.length === 0,
  orphan.length ? orphan.map((m) => `${m.id}→${m.shotId ?? '空'}`).join(', ') : '全部命中'
);

// S7 六段结构齐全
const SECTIONS = [
  'subject_definitions',
  'summary',
  'retention_analysis',
  'detailed_description',
  'overall_soundscape',
  'non_diegetic_music',
];
const missingSections = [];
for (const m of motions) {
  const missing = SECTIONS.filter(
    (s) => !new RegExp(`^>\\s*${s}\\s*[:：]`, 'm').test(m.body)
  );
  if (missing.length) missingSections.push(`${m.id}: ${missing.join('/')}`);
}
check(
  'S7 H3 六段结构齐全',
  missingSections.length === 0,
  missingSections.length ? missingSections.join(' | ') : '全部齐全'
);

// S8 <Picture N> 编号不超过挂图顺序
const pictureProblems = [];
for (const m of motions) {
  const used = [...m.body.matchAll(/<Picture\s+(\d+)>/g)].map((x) => Number(x[1]));
  const orderField = m.body.match(/顺序[：:]\s*([^\n]+)/);
  const declared = orderField ? [...orderField[1].matchAll(/(\d+)/g)].map((x) => Number(x[1])) : [];
  const maxUsed = used.length ? Math.max(...used) : 0;
  const maxDeclared = declared.length ? Math.max(...declared) : 0;
  if (maxUsed > maxDeclared) {
    pictureProblems.push(`${m.id}: 用了 <Picture ${maxUsed}> 但只声明到顺序 ${maxDeclared}`);
  }
}
check(
  'S8 <Picture N> 不超过挂图顺序',
  pictureProblems.length === 0,
  pictureProblems.length ? pictureProblems.join(' | ') : '全部一致'
);

// S9 中文对白语速 ≤ 4.5 字/秒
const pacingProblems = [];
for (const m of motions) {
  const lines = [...m.body.matchAll(/<d>\s*\[Chinese\]\s*([^<]*)<\/d>/g)].map((x) => x[1]);
  const chars = lines.reduce((n, t) => n + (t.match(/[一-鿿]/g) || []).length, 0);
  if (chars > 0 && m.duration) {
    const rate = chars / m.duration;
    if (rate > 4.5) {
      pacingProblems.push(`${m.id}: ${chars} 字 / ${m.duration}s = ${rate.toFixed(2)} 字每秒`);
    }
  }
}
check(
  'S9 中文对白语速 ≤ 4.5 字/秒',
  pacingProblems.length === 0,
  pacingProblems.length ? pacingProblems.join(' | ') : '全部合规'
);

// S10 禁用错误规格
const banned = ['1080p', '1080P', '30fps', '30 fps', '60fps'];
const foundBanned = banned.filter((b) => motionText.includes(b) || board.includes(b));
check(
  'S10 无错误规格（1080p / 30fps）',
  foundBanned.length === 0,
  foundBanned.length ? `出现 ${foundBanned.join(', ')}` : '未出现'
);

// S11 连续性锁面出现在引用了对应资产板的 MOTION 正文里
const locks = [];
for (const line of visual.split('\n')) {
  const m = line.match(/连续性锁[：:]\s*(LOCK-[A-Za-z0-9-]+).*?图片提示词项[：:]\s*(IMG-[A-Za-z0-9-]+).*?锁面[：:]\s*(.+)$/);
  if (m) locks.push({ id: m[1], img: m[2], surface: m[3].trim() });
}
// 同一张资产板可能含多套造型，单镜只穿其中一套：
// 锁面一次都没出现 = 失败；部分镜头出现 = 通过但告警（列出未覆盖镜号）。
const lockFailures = [];
const lockWarnings = [];
let usedLocks = 0;
for (const lock of locks) {
  const related = motions.filter((m) => m.body.includes(lock.img));
  if (related.length === 0) continue;
  usedLocks += 1;
  const hits = related.filter((m) => m.body.toLowerCase().includes(lock.surface.toLowerCase()));
  if (hits.length === 0) {
    lockFailures.push(`${lock.id} 在任何引用 ${lock.img} 的镜头里都没出现`);
  } else if (hits.length < related.length) {
    const missed = related.filter((m) => !hits.includes(m));
    lockWarnings.push(`${lock.id} 覆盖 ${hits.length}/${related.length}，未出现于 ${missed.map((m) => m.id).join('/')}`);
  }
}
check(
  'S11 连续性锁面逐字复现',
  lockFailures.length === 0,
  usedLocks === 0
    ? '未发现连续性锁（跳过）'
    : lockFailures.length
      ? lockFailures.join(' | ')
      : lockWarnings.length
        ? `${usedLocks} 条锁均有命中；部分镜头未复述：${lockWarnings.join(' | ')}`
        : `${usedLocks} 条锁全部逐镜命中`,
  lockWarnings.length ? 'warn' : undefined
);

// ---------- 输出 ----------
const failed = findings.filter((f) => f.level === 'fail');
const warned = findings.filter((f) => f.level === 'warn');
if (jsonMode) {
  console.log(JSON.stringify({ episode: path.basename(episodeDir), totalSeconds: total, shots: shots.length, findings }, null, 2));
} else {
  console.log(`\n梨花误质检 · ${path.basename(episodeDir)}`);
  console.log(`分镜 ${shots.length} 镜 / MOTION ${motions.length} 条 / 总时长 ${total}s\n`);
  for (const f of findings) {
    const mark = f.level === 'fail' ? '✗' : f.level === 'warn' ? '⚠' : '✓';
    console.log(`${mark} ${f.id}  ${f.detail}`);
  }
  const summary = failed.length === 0
    ? `通过：0 项失败${warned.length ? `，${warned.length} 项告警` : ''}`
    : `未通过：${failed.length} 项失败${warned.length ? `，${warned.length} 项告警` : ''}`;
  console.log(`\n${summary}\n`);
}

process.exit(failed.length === 0 ? 0 : 1);
