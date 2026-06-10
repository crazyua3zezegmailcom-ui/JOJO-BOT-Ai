import fs from 'fs';
import path from 'path';

// ══════════════════════════════════════════════════
//  PHASE 1 — Cache + Filter + Cleanup + DB Debounce
// ══════════════════════════════════════════════════

// Central cache
const _cache = new Map();

export const setCache = (key, value, ttlMs = 60_000) => {
  _cache.set(key, { value, exp: Date.now() + ttlMs });
};

export const getCache = (key) => {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) { _cache.delete(key); return null; }
  return entry.value;
};

export const cacheSize = () => _cache.size;

// Old-message filter (+120 seconds) + dedup
const _seen = new Set();
export const isOldOrDuplicate = (msgId, msgTimestamp) => {
  const now = Math.floor(Date.now() / 1000);
  if (now - (msgTimestamp || 0) > 120) return true;
  if (_seen.has(msgId)) return true;
  _seen.add(msgId);
  if (_seen.size > 2000) {
    const first = _seen.values().next().value;
    _seen.delete(first);
  }
  return false;
};

// /tmp cleanup every 30 minutes
const cleanTmp = () => {
  const dir = '/tmp';
  try {
    const files = fs.readdirSync(dir);
    let removed = 0;
    for (const f of files) {
      try {
        const p = path.join(dir, f);
        const stat = fs.statSync(p);
        if (stat.isFile() && Date.now() - stat.mtimeMs > 15 * 60_000) {
          fs.unlinkSync(p);
          removed++;
        }
      } catch {}
    }
    if (removed) console.log(`🧹 /tmp تنظيف: حذف ${removed} ملف`);
  } catch {}
};
setInterval(cleanTmp, 30 * 60_000);

// DB write debounce (exported helper — 500ms)
const _dbTimers = new Map();
export const debouncedDbWrite = (key, writeFn, delay = 500) => {
  if (_dbTimers.has(key)) clearTimeout(_dbTimers.get(key));
  _dbTimers.set(key, setTimeout(() => {
    writeFn();
    _dbTimers.delete(key);
  }, delay));
};

// ══════════════════════════════════════════════════
//  PHASE 2 — Concurrent Processing
// ══════════════════════════════════════════════════

const userQueues = new Map();
const MAX_CONCURRENT = 5;
let activeCount = 0;

const _responseTimes = [];
const _MAX_SAMPLES = 100;

const recordTime = (ms) => {
  _responseTimes.push(ms);
  if (_responseTimes.length > _MAX_SAMPLES) _responseTimes.shift();
};

// Wait for a free slot
const waitForSlot = () =>
  new Promise(resolve => {
    const check = setInterval(() => {
      if (activeCount < MAX_CONCURRENT) {
        clearInterval(check);
        resolve();
      }
    }, 500);
  });

export const runConcurrent = async (userId, jid, taskFn, conn) => {
  if (userQueues.get(userId)) {
    await conn.sendMessage(jid, {
      text: '⏳ أمرك السابق لسه شغال — استنى ثواني'
    });
    return;
  }

  if (activeCount >= MAX_CONCURRENT) {
    await conn.sendMessage(jid, {
      text: '⚙️ البوت مشغول — هيجيلك ردك في ثواني'
    });
    await waitForSlot();
  }

  userQueues.set(userId, true);
  activeCount++;
  const t0 = Date.now();

  try {
    await taskFn();
  } finally {
    recordTime(Date.now() - t0);
    userQueues.delete(userId);
    activeCount--;
  }
};

// Worker Pool للأوامر الثقيلة
export const workerPool = {
  workers: new Map(),
  maxWorkers: 5,

  async run(taskId, taskFn) {
    const promise = taskFn().finally(() => {
      this.workers.delete(taskId);
    });
    this.workers.set(taskId, promise);
    return promise;
  },

  getActive() {
    return this.workers.size;
  }
};

// ══════════════════════════════════════════════════
//  PHASE 2 — Speed Improvements
// ══════════════════════════════════════════════════

// Typing indicator
export const showTyping = async (conn, jid) => {
  try {
    await conn.sendPresenceUpdate('composing', jid);
    setTimeout(() =>
      conn.sendPresenceUpdate('paused', jid).catch(() => {}),
      2000
    );
  } catch {}
};

// Fetch with timeout
export const fetchWithTimeout = async (url, ms = 10_000, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

// ══════════════════════════════════════════════════
//  PHASE 2 — Session Monitoring
// ══════════════════════════════════════════════════

const SESSION_DIR = './session';
const MAX_MB = 30;

export const checkSessionSize = () => {
  if (!fs.existsSync(SESSION_DIR)) return 0;
  let total = 0;
  try {
    for (const f of fs.readdirSync(SESSION_DIR)) {
      try { total += fs.statSync(`${SESSION_DIR}/${f}`).size; } catch {}
    }
  } catch {}
  const mb = parseFloat((total / 1024 / 1024).toFixed(1));
  if (mb > MAX_MB) console.log(`⚠️ Session ${mb}MB — تجاوز الحد`);
  return mb;
};
setInterval(checkSessionSize, 60 * 60_000);

// /tmp file count
export const tmpFileCount = () => {
  try { return fs.readdirSync('/tmp').length; } catch { return 0; }
};

// ══════════════════════════════════════════════════
//  PHASE 2 — Pre-load Static Assets
// ══════════════════════════════════════════════════

export const assets = {};
let _assetsLoaded = false;

const fetchBuffer = async (url) => {
  const res = await fetchWithTimeout(url, 15_000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

export const preload = async () => {
  if (_assetsLoaded) return;
  const list = [
    { k: 'menu',  url: global.db?.menuImage },
    { k: 'dev',   url: global.db?.devImage },
    { k: 'audio', url: global.db?.devAudio }
  ];
  await Promise.all(
    list.filter(i => i.url).map(async ({ k, url }) => {
      try { assets[k] = await fetchBuffer(url); } catch {}
    })
  );
  _assetsLoaded = true;
};
setTimeout(preload, 5000);

// ══════════════════════════════════════════════════
//  PHASE 2 — Stats for .أداء command
// ══════════════════════════════════════════════════

export const getStats = () => {
  const times = _responseTimes;
  const avg  = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const min  = times.length ? Math.min(...times) : 0;
  const max  = times.length ? Math.max(...times) : 0;
  const mem  = parseFloat((process.memoryUsage().rss / 1024 / 1024).toFixed(1));
  const ses  = checkSessionSize();
  const tmp  = tmpFileCount();

  return {
    active:  activeCount,
    queued:  userQueues.size,
    workers: workerPool.getActive(),
    avg, min, max,
    mem, ses, tmp,
    cacheItems: _cache.size
  };
};
