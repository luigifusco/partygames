// Battle sound effects.
//
// Cross-platform notes:
// - iOS Safari + most mobile browsers require AudioContext.resume() AND a
//   first sound to play during a real user gesture before any further audio
//   will be heard. We therefore expose `unlockAudio()` to be called from
//   the user's first click/touch (e.g., the "Start Battle" button), and we
//   also auto-attach a one-shot pointerdown/touchstart/keydown listener as
//   a safety net.
// - We pool & cache HTMLAudioElement instances keyed by URL, and use
//   .cloneNode(true) on each play so overlapping plays work without
//   leaking elements or stalling on mobile.
// - Every Audio() and AudioContext call is wrapped so missing files /
//   blocked autoplay never throw past the public API.

import { BASE_PATH } from '../config';

const SHOWDOWN_CDN = 'https://play.pokemonshowdown.com';

// ─── Persistent mute state ───────────────────────────────────────────────
//
// Two independent mute toggles: background music (BGM) and sound effects
// (moves, hits, cries, status, etc). Persisted to localStorage so the
// choice survives page reloads and future battles.

const BGM_MUTE_KEY = 'pp:bgmMuted';
const SFX_MUTE_KEY = 'pp:sfxMuted';

function loadFlag(key: string): boolean {
  try { return typeof window !== 'undefined' && window.localStorage?.getItem(key) === '1'; } catch { return false; }
}
function saveFlag(key: string, value: boolean): void {
  try { window.localStorage?.setItem(key, value ? '1' : '0'); } catch { /* noop */ }
}

let bgmMuted = loadFlag(BGM_MUTE_KEY);
let sfxMuted = loadFlag(SFX_MUTE_KEY);

export function isBgmMuted(): boolean { return bgmMuted; }
export function isSfxMuted(): boolean { return sfxMuted; }

export function setBgmMuted(muted: boolean): void {
  bgmMuted = muted;
  saveFlag(BGM_MUTE_KEY, muted);
  if (currentBgm) currentBgm.muted = muted;
}
export function setSfxMuted(muted: boolean): void {
  sfxMuted = muted;
  saveFlag(SFX_MUTE_KEY, muted);
}

export function toggleBgmMute(): boolean { setBgmMuted(!bgmMuted); return bgmMuted; }
export function toggleSfxMute(): boolean { setSfxMuted(!sfxMuted); return sfxMuted; }

// ─── Shared AudioContext + unlock ────────────────────────────────────────

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch { return null; }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Call from the first real user gesture (click/touch) so subsequent
 *  audio plays work on iOS Safari + Android Chrome strict autoplay policies.
 *  Auto-called on first pointer/touch/key event as a safety net. */
export function unlockAudio(): void {
  if (unlocked) return;
  unlocked = true;
  const ac = getCtx();
  if (ac) {
    try {
      const buf = ac.createBuffer(1, 1, 22050);
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.connect(ac.destination);
      src.start(0);
    } catch { /* noop */ }
  }
  try {
    const a = new Audio();
    a.muted = true;
    a.src = `${BASE_PATH}/hit-normal-damage.mp3`;
    const p = a.play();
    if (p && typeof p.then === 'function') {
      p.then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
    }
  } catch { /* noop */ }
}

if (typeof window !== 'undefined') {
  const handler = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('touchstart', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler, { once: true, passive: true });
  window.addEventListener('touchstart', handler, { once: true, passive: true });
  window.addEventListener('keydown', handler, { once: true });
}

// ─── HTMLAudioElement cache / pool ───────────────────────────────────────
//
// One "template" HTMLAudioElement per URL (preload="auto"), cloned for each
// playback. Cloning is dramatically cheaper than `new Audio(url)` because
// the browser reuses the cached resource.

interface CacheEntry {
  el: HTMLAudioElement;
  failed: boolean;
}
const audioCache = new Map<string, CacheEntry>();

function getOrCreate(url: string): CacheEntry {
  let entry = audioCache.get(url);
  if (entry) return entry;
  const el = new Audio();
  el.preload = 'auto';
  el.src = url;
  entry = { el, failed: false };
  el.addEventListener('error', () => { entry!.failed = true; }, { once: true });
  try { el.load(); } catch { /* noop */ }
  audioCache.set(url, entry);
  return entry;
}

function playUrl(url: string, volume = 0.4, playbackRate = 1.0): boolean {
  if (sfxMuted) return true;
  const entry = getOrCreate(url);
  if (entry.failed) return false;
  try {
    const node = entry.el.cloneNode(true) as HTMLAudioElement;
    node.volume = Math.max(0, Math.min(1, volume));
    node.playbackRate = playbackRate;
    const p = node.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => { entry.failed = true; });
    }
    return true;
  } catch {
    entry.failed = true;
    return false;
  }
}

// Decoded AudioBuffer cache — used for channel-swapped playback when a
// move originates from the opponent's side. Falls back to HTMLAudio if
// decoding fails or Web Audio is unavailable.
const bufferCache = new Map<string, Promise<AudioBuffer | null>>();

function loadBuffer(url: string): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(url);
  if (cached) return cached;
  const ac = getCtx();
  if (!ac) return Promise.resolve(null);
  const p = fetch(url)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('bad'))))
    .then((ab) => ac.decodeAudioData(ab))
    .catch(() => null);
  bufferCache.set(url, p);
  return p;
}

/** Play a sound with L/R channels swapped — used when the attacker is on
 *  the right side of the arena, so the stereo pan tracks left→right. */
function playUrlReversed(url: string, volume = 0.4, playbackRate = 1.0): boolean {
  if (sfxMuted) return true;
  const ac = getCtx();
  if (!ac) return playUrl(url, volume, playbackRate);
  loadBuffer(url).then((buf) => {
    if (!buf) { playUrl(url, volume, playbackRate); return; }
    try {
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = playbackRate;
      const gain = ac.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume));
      if (buf.numberOfChannels >= 2) {
        const splitter = ac.createChannelSplitter(2);
        const merger = ac.createChannelMerger(2);
        src.connect(splitter);
        // swap: L(0) → merger.R(1), R(1) → merger.L(0)
        splitter.connect(merger, 0, 1);
        splitter.connect(merger, 1, 0);
        merger.connect(gain).connect(ac.destination);
      } else {
        // mono: nothing to swap, just play
        src.connect(gain).connect(ac.destination);
      }
      src.start();
    } catch {
      playUrl(url, volume, playbackRate);
    }
  });
  return true;
}

/** Preload a list of URLs into the cache. Safe to call multiple times. */
export function preloadAudio(urls: string[]): void {
  for (const url of urls) getOrCreate(url);
}

// ─── Synthesized fallback move SFX (Web Audio) ───────────────────────────

type SfxType =
  | 'hit' | 'hit-hard' | 'hit-weak'
  | 'electric' | 'fire' | 'water' | 'ice' | 'grass'
  | 'psychic' | 'ghost' | 'poison' | 'ground'
  | 'rock' | 'fighting' | 'flying' | 'dragon' | 'steel'
  | 'normal' | 'bug'
  | 'weather' | 'faint' | 'miss';

function playTone(
  ac: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine',
  volume = 0.3, detune = 0,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

function playNoise(ac: AudioContext, duration: number, volume = 0.15) {
  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  source.connect(gain);
  gain.connect(ac.destination);
  source.start();
}

const SFX_PLAYERS: Record<SfxType, (ac: AudioContext) => void> = {
  'hit':       (ac) => { playNoise(ac, 0.10, 0.20); playTone(ac, 200, 0.10, 'square', 0.15); },
  'hit-hard':  (ac) => { playNoise(ac, 0.15, 0.30); playTone(ac, 120, 0.15, 'square', 0.20); playTone(ac, 80, 0.20, 'sawtooth', 0.10); },
  'hit-weak':  (ac) => { playNoise(ac, 0.08, 0.10); playTone(ac, 300, 0.08, 'sine', 0.10); },
  'electric':  (ac) => { playTone(ac, 800, 0.08, 'sawtooth', 0.20); setTimeout(() => playTone(ac, 1200, 0.06, 'sawtooth', 0.15), 50); setTimeout(() => playTone(ac, 600, 0.10, 'square', 0.20), 100); playNoise(ac, 0.15, 0.15); },
  'fire':      (ac) => { playNoise(ac, 0.30, 0.20); playTone(ac, 300, 0.20, 'sawtooth', 0.15); playTone(ac, 200, 0.30, 'triangle', 0.10); },
  'water':     (ac) => { playNoise(ac, 0.20, 0.12); playTone(ac, 400, 0.15, 'sine', 0.15); playTone(ac, 350, 0.20, 'sine', 0.10, 50); },
  'ice':       (ac) => { playTone(ac, 1000, 0.12, 'sine', 0.20); playTone(ac, 1500, 0.08, 'sine', 0.10); playNoise(ac, 0.10, 0.10); },
  'grass':     (ac) => { playTone(ac, 500, 0.15, 'sine', 0.15); playTone(ac, 600, 0.10, 'triangle', 0.10); playNoise(ac, 0.08, 0.08); },
  'psychic':   (ac) => { playTone(ac, 600, 0.30, 'sine', 0.20); playTone(ac, 900, 0.20, 'sine', 0.10, 100); },
  'ghost':     (ac) => { playTone(ac, 200, 0.40, 'sine', 0.15); playTone(ac, 150, 0.50, 'sine', 0.10, -50); },
  'poison':    (ac) => { playTone(ac, 250, 0.20, 'sawtooth', 0.12); playNoise(ac, 0.15, 0.10); },
  'ground':    (ac) => { playTone(ac, 60, 0.30, 'square', 0.25); playTone(ac, 40, 0.40, 'sawtooth', 0.15); playNoise(ac, 0.20, 0.20); },
  'rock':      (ac) => { playNoise(ac, 0.15, 0.25); playTone(ac, 100, 0.15, 'square', 0.20); },
  'fighting':  (ac) => { playNoise(ac, 0.10, 0.25); playTone(ac, 150, 0.10, 'square', 0.20); },
  'flying':    (ac) => { playNoise(ac, 0.20, 0.10); playTone(ac, 500, 0.15, 'triangle', 0.12); },
  'dragon':    (ac) => { playTone(ac, 150, 0.30, 'sawtooth', 0.20); playTone(ac, 200, 0.25, 'square', 0.15, 50); },
  'steel':     (ac) => { playTone(ac, 1200, 0.10, 'square', 0.20); playTone(ac, 800, 0.08, 'sawtooth', 0.15); playNoise(ac, 0.05, 0.15); },
  'normal':    (ac) => { playNoise(ac, 0.10, 0.15); playTone(ac, 250, 0.10, 'square', 0.12); },
  'bug':       (ac) => { playTone(ac, 700, 0.08, 'square', 0.10); playTone(ac, 800, 0.06, 'square', 0.08); playNoise(ac, 0.08, 0.08); },
  'weather':   (ac) => { playNoise(ac, 0.40, 0.08); playTone(ac, 300, 0.30, 'sine', 0.05); },
  'faint':     (ac) => { playTone(ac, 400, 0.10, 'sine', 0.20); setTimeout(() => playTone(ac, 300, 0.15, 'sine', 0.15), 100); setTimeout(() => playTone(ac, 200, 0.20, 'sine', 0.10), 200); },
  'miss':      (ac) => { playNoise(ac, 0.15, 0.08); },
};

export function playSfx(type: SfxType): void {
  if (sfxMuted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    SFX_PLAYERS[type]?.(ac);
  } catch { /* noop */ }
}

const MOVE_SFX: Record<string, SfxType> = {
  'Ember': 'fire', 'Flamethrower': 'fire',
  'Water Gun': 'water', 'Hydro Pump': 'water', 'Surf': 'water', 'Absorb': 'grass',
  'Thunderbolt': 'electric', 'Thunder': 'electric',
  'Vine Whip': 'grass', 'Razor Leaf': 'grass', 'Giga Drain': 'grass', 'Solar Beam': 'grass',
  'Ice Beam': 'ice',
  'Confusion': 'psychic', 'Psybeam': 'psychic', 'Psychic': 'psychic', 'Hidden Power': 'psychic',
  'Lick': 'ghost', 'Night Shade': 'ghost', 'Shadow Ball': 'ghost', 'Crunch': 'ghost',
  'Karate Chop': 'fighting', 'Low Kick': 'fighting', 'Cross Chop': 'fighting', 'Dynamic Punch': 'fighting',
  'Poison Sting': 'poison', 'Sludge Bomb': 'poison',
  'Bug Bite': 'bug', 'Silver Wind': 'bug', 'Pin Missile': 'bug',
  'Gust': 'flying', 'Peck': 'flying', 'Wing Attack': 'flying',
  'Aerial Ace': 'flying', 'Drill Peck': 'flying', 'Air Cutter': 'flying', 'Air Slash': 'flying',
  'Tackle': 'normal', 'Scratch': 'normal', 'Quick Attack': 'normal',
  'Hyper Fang': 'normal', 'Body Slam': 'hit-hard', 'Slam': 'hit-hard',
  'Headbutt': 'hit', 'Take Down': 'hit-hard', 'Struggle': 'hit-weak',
  'Rock Throw': 'rock', 'Rock Slide': 'rock', 'Dig': 'ground', 'Earthquake': 'ground',
  'Twister': 'dragon', 'Dragon Claw': 'dragon',
  'Meteor Mash': 'steel', 'Zen Headbutt': 'psychic',
  'Rain Dance': 'weather', 'Sunny Day': 'weather', 'Sandstorm': 'weather', 'Hail': 'weather',
  'Stealth Rock': 'rock', 'Spikes': 'ground', 'Toxic Spikes': 'poison',
  'Rapid Spin': 'normal', 'Defog': 'flying',
};

export function getMoveSfxType(moveName: string): SfxType {
  return MOVE_SFX[moveName] || 'hit';
}

// ─── Per-move MP3 SFX ────────────────────────────────────────────────────

function moveSfxUrl(moveName: string): string {
  return `${BASE_PATH}/sfx/${encodeURIComponent(moveName)}.mp3`;
}

export function playMoveSfx(moveName: string, volume = 0.35, reversed = false): void {
  if (!moveName) return;
  const url = moveSfxUrl(moveName);
  if (reversed) playUrlReversed(url, volume);
  else playUrl(url, volume);
}

// ─── Hit sounds (effectiveness) ──────────────────────────────────────────

const HIT_SOUNDS: Record<string, string> = {
  'super':    `${BASE_PATH}/hit-super-effective.mp3`,
  'not-very': `${BASE_PATH}/hit-not-very-effective.mp3`,
  'neutral':  `${BASE_PATH}/hit-normal-damage.mp3`,
};

export function playHitSound(effectiveness: 'super' | 'neutral' | 'not-very' | 'immune' | null, volume = 0.4, reversed = false): void {
  if (!effectiveness || effectiveness === 'immune') return;
  const url = HIT_SOUNDS[effectiveness] ?? HIT_SOUNDS['neutral'];
  if (reversed) playUrlReversed(url, volume);
  else playUrl(url, volume);
}

export function preloadHitSounds(): void {
  preloadAudio(Object.values(HIT_SOUNDS));
}

// ─── Stat boost / drop SFX ───────────────────────────────────────────────

const STAT_SFX: Record<'up' | 'down', string> = {
  'up':   `${BASE_PATH}/sfx/${encodeURIComponent('Stat Rise Up')}.mp3`,
  'down': `${BASE_PATH}/sfx/${encodeURIComponent('Stat Fall')}.mp3`,
};

export function playStatChangeSfx(direction: 'up' | 'down', volume = 0.4): void {
  playUrl(STAT_SFX[direction], volume);
}

// ─── Status condition SFX ────────────────────────────────────────────────

const STATUS_SFX: Record<string, string> = {
  'burn':       `${BASE_PATH}/sfx/${encodeURIComponent('Status Burned')}.mp3`,
  'paralysis':  `${BASE_PATH}/sfx/${encodeURIComponent('Status Paralyzed')}.mp3`,
  'poison':     `${BASE_PATH}/sfx/${encodeURIComponent('Status Poisoned')}.mp3`,
  'toxic':      `${BASE_PATH}/sfx/${encodeURIComponent('Status Poisoned')}.mp3`,
  'freeze':     `${BASE_PATH}/sfx/${encodeURIComponent('Status Frozen')}.mp3`,
};

export function playStatusSfx(status: string, volume = 0.4): void {
  const url = STATUS_SFX[status];
  if (url) playUrl(url, volume);
}

const FAINT_SFX_URL = `${BASE_PATH}/sfx/${encodeURIComponent('In-Battle Faint No Health')}.mp3`;

export function playFaintSfx(volume = 0.4): void {
  playUrl(FAINT_SFX_URL, volume);
}

export function preloadStatSounds(): void {
  preloadAudio([STAT_SFX.up, STAT_SFX.down, FAINT_SFX_URL, ...Object.values(STATUS_SFX)]);
}

// ─── Battle BGM ──────────────────────────────────────────────────────────

interface BgmTrack {
  url: string;
  loopStart: number;
  loopEnd: number;
}

const BATTLE_BGMS: BgmTrack[] = [
  { url: 'audio/dpp-trainer.mp3', loopStart: 13.440, loopEnd: 96.959 },
  { url: 'audio/dpp-rival.mp3', loopStart: 13.888, loopEnd: 66.352 },
  { url: 'audio/hgss-johto-trainer.mp3', loopStart: 23.731, loopEnd: 125.086 },
  { url: 'audio/hgss-kanto-trainer.mp3', loopStart: 13.003, loopEnd: 94.656 },
  { url: 'audio/bw-trainer.mp3', loopStart: 14.629, loopEnd: 110.109 },
  { url: 'audio/bw-rival.mp3', loopStart: 19.180, loopEnd: 57.373 },
  { url: 'audio/bw-subway-trainer.mp3', loopStart: 15.503, loopEnd: 110.984 },
  { url: 'audio/bw2-rival.mp3', loopStart: 7.152, loopEnd: 68.708 },
  { url: 'audio/xy-trainer.mp3', loopStart: 7.802, loopEnd: 82.469 },
  { url: 'audio/xy-rival.mp3', loopStart: 7.802, loopEnd: 58.634 },
  { url: 'audio/oras-trainer.mp3', loopStart: 13.579, loopEnd: 91.548 },
  { url: 'audio/oras-rival.mp3', loopStart: 14.303, loopEnd: 69.149 },
  { url: 'audio/sm-trainer.mp3', loopStart: 8.323, loopEnd: 89.230 },
  { url: 'audio/sm-rival.mp3', loopStart: 11.389, loopEnd: 62.158 },
];

const BGM_KANTO_GYM: BgmTrack = { url: 'audio/bw2-kanto-gym-leader.mp3', loopStart: 14.626, loopEnd: 58.986 };
const BGM_JOHTO_TRAINER: BgmTrack = { url: 'audio/hgss-johto-trainer.mp3', loopStart: 23.731, loopEnd: 125.086 };
const BGM_ELITE4: BgmTrack = { url: 'audio/spl-elite4.mp3', loopStart: 3.962, loopEnd: 152.509 };
const BGM_CHAMPION_DPP: BgmTrack = { url: 'audio/dpp-trainer.mp3', loopStart: 13.440, loopEnd: 96.959 };
const BGM_RIVAL_DPP: BgmTrack = { url: 'audio/dpp-rival.mp3', loopStart: 13.888, loopEnd: 66.352 };
const BGM_HOENN_TRAINER: BgmTrack = { url: 'audio/oras-trainer.mp3', loopStart: 13.579, loopEnd: 91.548 };
const BGM_HOENN_RIVAL: BgmTrack = { url: 'audio/oras-rival.mp3', loopStart: 14.303, loopEnd: 69.149 };
const BGM_SINNOH_TRAINER: BgmTrack = { url: 'audio/dpp-trainer.mp3', loopStart: 13.440, loopEnd: 96.959 };
const BGM_RED: BgmTrack = { url: 'audio/bw2-kanto-gym-leader.mp3', loopStart: 14.626, loopEnd: 58.986 };

const TRAINER_BGM: Record<string, BgmTrack> = {
  brock: BGM_KANTO_GYM, misty: BGM_KANTO_GYM, ltsurge: BGM_KANTO_GYM,
  erika: BGM_KANTO_GYM, koga: BGM_KANTO_GYM, janine: BGM_KANTO_GYM,
  sabrina: BGM_KANTO_GYM, blaine: BGM_KANTO_GYM, giovanni: BGM_KANTO_GYM,
  bruno: BGM_ELITE4, lance: BGM_ELITE4, blue: BGM_ELITE4, red: BGM_RED,
  falkner: BGM_JOHTO_TRAINER, bugsy: BGM_JOHTO_TRAINER, whitney: BGM_JOHTO_TRAINER,
  morty: BGM_JOHTO_TRAINER, chuck: BGM_JOHTO_TRAINER, jasmine: BGM_JOHTO_TRAINER,
  pryce: BGM_JOHTO_TRAINER, clair: BGM_JOHTO_TRAINER,
  will: BGM_ELITE4, karen: BGM_ELITE4, silver: BGM_RIVAL_DPP,
  roxanne: BGM_HOENN_TRAINER, brawly: BGM_HOENN_TRAINER, wattson: BGM_HOENN_TRAINER,
  flannery: BGM_HOENN_TRAINER, norman: BGM_HOENN_TRAINER, winona: BGM_HOENN_TRAINER,
  sidney: BGM_ELITE4, phoebe: BGM_ELITE4, glacia: BGM_ELITE4, drake: BGM_ELITE4,
  steven: BGM_ELITE4, wallace: BGM_ELITE4,
  fantina: BGM_SINNOH_TRAINER, maylene: BGM_SINNOH_TRAINER, crasherwake: BGM_SINNOH_TRAINER,
  byron: BGM_SINNOH_TRAINER, candice: BGM_SINNOH_TRAINER, volkner: BGM_SINNOH_TRAINER,
  aaron: BGM_ELITE4, bertha: BGM_ELITE4, flint: BGM_ELITE4, lucian: BGM_ELITE4,
  cynthia: BGM_CHAMPION_DPP, barry: BGM_RIVAL_DPP,
};

let currentBgm: HTMLAudioElement | null = null;
let bgmLoopHandler: (() => void) | null = null;

export function startBattleBgm(volume = 0.25, trainerId?: string): void {
  stopBattleBgm();
  try {
    const track = trainerId && TRAINER_BGM[trainerId]
      ? TRAINER_BGM[trainerId]
      : BATTLE_BGMS[Math.floor(Math.random() * BATTLE_BGMS.length)];
    const audio = new Audio(`${SHOWDOWN_CDN}/${track.url}`);
    audio.volume = volume;
    audio.muted = bgmMuted;
    bgmLoopHandler = () => {
      if (audio.currentTime >= track.loopEnd) audio.currentTime = track.loopStart;
    };
    audio.addEventListener('timeupdate', bgmLoopHandler);
    const p = audio.play();
    if (p && typeof p.then === 'function') p.catch(() => {});
    currentBgm = audio;
  } catch { /* noop */ }
}

export function stopBattleBgm(): void {
  if (currentBgm) {
    if (bgmLoopHandler) {
      currentBgm.removeEventListener('timeupdate', bgmLoopHandler);
      bgmLoopHandler = null;
    }
    try { currentBgm.pause(); } catch { /* noop */ }
    currentBgm = null;
  }
}

// ─── Pokémon cries ───────────────────────────────────────────────────────

export function playCry(pokemonName: string, volume = 0.3, playbackRate = 1.0): void {
  if (sfxMuted) return;
  if (!pokemonName) return;
  const id = pokemonName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const url = `${SHOWDOWN_CDN}/audio/cries/${id}.mp3`;
  const entry = getOrCreate(url);
  if (entry.failed) return;
  try {
    const node = entry.el.cloneNode(true) as HTMLAudioElement;
    node.volume = Math.max(0, Math.min(1, volume));
    node.playbackRate = playbackRate;
    const p = node.play();
    if (p && typeof p.then === 'function') p.catch(() => { entry.failed = true; });
  } catch { entry.failed = true; }
}

export function preloadCries(pokemonNames: string[]): void {
  const urls = pokemonNames.map((n) => {
    const id = n.toLowerCase().replace(/[^a-z0-9-]/g, '');
    return `${SHOWDOWN_CDN}/audio/cries/${id}.mp3`;
  });
  preloadAudio(urls);
}
