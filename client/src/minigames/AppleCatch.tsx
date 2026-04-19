import { useEffect, useRef, useState } from 'react';
import './AppleCatch.css';

interface AppleCatchProps {
  pokemonSprite: string;
  pokemonName: string;
  onFinish: (score: number) => void;
  onExit: () => void;
}

const FIELD_W = 480;
const FIELD_H = 640;
const PLAYER_W = 72;
const PLAYER_H = 72;
const ITEM_SIZE = 36;
const GAME_DURATION = 45;

type ItemKind = 'apple' | 'star' | 'rock';

interface Item {
  id: number;
  x: number;
  y: number;
  vy: number;
  kind: ItemKind;
}

const ITEM_POINTS: Record<ItemKind, number> = {
  apple: 1,
  star: 3,
  rock: -2,
};

const ITEM_EMOJI: Record<ItemKind, string> = {
  apple: '🍎',
  star: '⭐',
  rock: '🪨',
};

export default function AppleCatch({ pokemonSprite, pokemonName, onFinish, onExit }: AppleCatchProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const playerXRef = useRef(FIELD_W / 2);
  const [playerX, setPlayerX] = useState(FIELD_W / 2);
  const itemsRef = useRef<Item[]>([]);
  const [, forceRender] = useState(0);
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const elapsedRef = useRef(0);
  const spawnAccRef = useRef(0);
  const nextIdRef = useRef(1);
  const keysRef = useRef({ left: false, right: false });
  const [flash, setFlash] = useState<{ x: number; y: number; text: string; id: number } | null>(null);
  const flashIdRef = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let dragging = false;
    const updateFromEvent = (e: PointerEvent) => {
      const f = fieldRef.current;
      if (!f) return;
      const rect = f.getBoundingClientRect();
      if (rect.width <= 0) return;
      const scale = FIELD_W / rect.width;
      const localX = (e.clientX - rect.left) * scale;
      playerXRef.current = Math.max(PLAYER_W / 2, Math.min(FIELD_W - PLAYER_W / 2, localX));
      setPlayerX(playerXRef.current);
    };
    const onDown = (e: PointerEvent) => { dragging = true; updateFromEvent(e); };
    const onMove = (e: PointerEvent) => { if (dragging) updateFromEvent(e); };
    const onUp = () => { dragging = false; };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onUp);
    };
  }, []);

  useEffect(() => {
    if (!started || ended) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsedRef.current += dt;

      const speed = 320;
      if (keysRef.current.left) {
        playerXRef.current = Math.max(PLAYER_W / 2, playerXRef.current - speed * dt);
      }
      if (keysRef.current.right) {
        playerXRef.current = Math.min(FIELD_W - PLAYER_W / 2, playerXRef.current + speed * dt);
      }
      setPlayerX(playerXRef.current);

      const elapsed = elapsedRef.current;
      const spawnRate = 1.2 + elapsed / 18;
      spawnAccRef.current += dt * spawnRate;
      while (spawnAccRef.current >= 1) {
        spawnAccRef.current -= 1;
        const rockChance = Math.min(0.32, 0.15 + elapsed / 200);
        const starChance = 0.08;
        const r = Math.random();
        let kind: ItemKind;
        if (r < rockChance) kind = 'rock';
        else if (r < rockChance + starChance) kind = 'star';
        else kind = 'apple';
        itemsRef.current.push({
          id: nextIdRef.current++,
          x: ITEM_SIZE + Math.random() * (FIELD_W - ITEM_SIZE * 2),
          y: -ITEM_SIZE,
          vy: 180 + Math.random() * 80,
          kind,
        });
      }

      const fallMul = 1 + elapsed / 60;
      const items = itemsRef.current;
      const playerTop = FIELD_H - PLAYER_H - 8;
      const hitBoxL = playerXRef.current - PLAYER_W / 2 + 8;
      const hitBoxR = playerXRef.current + PLAYER_W / 2 - 8;
      const hitBoxT = playerTop + 6;
      const kept: Item[] = [];
      for (const it of items) {
        it.y += it.vy * dt * fallMul;
        if (it.y > FIELD_H + ITEM_SIZE) continue;
        const cx = it.x;
        const cy = it.y;
        if (cy + ITEM_SIZE / 2 >= hitBoxT && cy - ITEM_SIZE / 2 <= FIELD_H - 8 && cx >= hitBoxL && cx <= hitBoxR) {
          const pts = ITEM_POINTS[it.kind];
          scoreRef.current = Math.max(0, scoreRef.current + pts);
          setScore(scoreRef.current);
          flashIdRef.current += 1;
          setFlash({ x: cx, y: cy, text: pts > 0 ? `+${pts}` : `${pts}`, id: flashIdRef.current });
          continue;
        }
        kept.push(it);
      }
      itemsRef.current = kept;
      forceRender(v => v + 1);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, ended]);

  useEffect(() => {
    if (!started || ended) return;
    if (timeLeft <= 0) {
      setEnded(true);
      setTimeout(() => onFinish(scoreRef.current), 400);
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [started, ended, timeLeft, onFinish]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(f => (f && f.id === flash.id ? null : f)), 500);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <div className="applecatch-root">
      <div className="applecatch-top">
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onExit}>← Quit</button>
        <div className="applecatch-status">
          <div className="applecatch-stat">
            <span className="applecatch-stat-label">Score</span>
            <span className="applecatch-stat-value">{score}</span>
          </div>
          <div className="applecatch-stat">
            <span className="applecatch-stat-label">Time</span>
            <span className="applecatch-stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>
      <div className="applecatch-stage" ref={stageRef}>
        <ScaledField width={FIELD_W} height={FIELD_H} fieldRef={fieldRef}>
          <div className="applecatch-field" style={{ width: FIELD_W, height: FIELD_H }}>
          {itemsRef.current.map(it => (
            <div
              key={it.id}
              className={`applecatch-item applecatch-item-${it.kind}`}
              style={{ left: it.x - ITEM_SIZE / 2, top: it.y - ITEM_SIZE / 2, width: ITEM_SIZE, height: ITEM_SIZE }}
            >
              {ITEM_EMOJI[it.kind]}
            </div>
          ))}
          {flash && (
            <div
              key={flash.id}
              className={`applecatch-flash ${flash.text.startsWith('-') ? 'applecatch-flash-neg' : 'applecatch-flash-pos'}`}
              style={{ left: flash.x, top: flash.y }}
            >
              {flash.text}
            </div>
          )}
          <img
            src={pokemonSprite}
            alt={pokemonName}
            className="applecatch-player"
            draggable={false}
            style={{ left: playerX - PLAYER_W / 2, top: FIELD_H - PLAYER_H - 8, width: PLAYER_W, height: PLAYER_H }}
          />
          <div className="applecatch-ground" />
          {!started && (
            <div className="applecatch-overlay">
              <div className="applecatch-overlay-title">Apple Catch</div>
              <div className="applecatch-overlay-hint">← → to move · catch 🍎 and ⭐ · avoid 🪨</div>
              <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={() => setStarted(true)}>Start</button>
            </div>
          )}
          {ended && (
            <div className="applecatch-overlay">
              <div className="applecatch-overlay-title">Time's Up!</div>
              <div className="applecatch-overlay-score">Score: {score}</div>
            </div>
          )}
          </div>
        </ScaledField>
      </div>
    </div>
  );
}

function ScaledField({ width, height, fieldRef, children }: { width: number; height: number; fieldRef: React.RefObject<HTMLDivElement>; children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const s = Math.min(rect.width / width, rect.height / height, 1.5);
      setScale(s > 0 ? s : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);
  return (
    <div ref={wrapRef} className="applecatch-scale-wrap">
      <div
        ref={fieldRef}
        className="applecatch-scale-inner"
        style={{ width, height, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
