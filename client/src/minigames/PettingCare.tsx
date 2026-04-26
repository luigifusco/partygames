import { type CSSProperties, useEffect, useRef, useState } from 'react';
import './PettingCare.css';

interface PettingCareProps {
  pokemonSprite: string;
  pokemonName: string;
  onFinish: (score: number) => void;
  onExit: () => void;
}

interface MoodDef {
  id: string;
  label: string;
  target: number;
  color: string;
}

interface Pop {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotate: number;
  text: string;
  kind: 'good' | 'miss' | 'shift' | 'xp';
}

interface Point {
  x: number;
  y: number;
  t: number;
  onPokemon: boolean;
  pokemonWidth: number;
}

interface SpeedSample {
  t: number;
  speed: number;
}

const GAME_DURATION = 35;
const MAX_DISPLAY_SPEED = 5.5;
const SPEED_AVERAGE_WINDOW_MS = 250;
const XP_TICK_SECONDS = 0.5;

const MOODS: MoodDef[] = [
  { id: 'drowsy', label: 'Drowsy', target: 1.1, color: '#98d8ff' },
  { id: 'cozy', label: 'Cozy', target: 1.7, color: '#ffb6dc' },
  { id: 'playful', label: 'Playful', target: 2.5, color: '#ffd35a' },
  { id: 'excited', label: 'Excited', target: 3.7, color: '#ff9a3c' },
  { id: 'zoomies', label: 'Zoomies', target: MAX_DISPLAY_SPEED, color: '#ff5d7d' },
];

function randomMood(except?: string): MoodDef {
  const pool = MOODS.filter((m) => m.id !== except);
  return pool[Math.floor(Math.random() * pool.length)] ?? MOODS[0];
}

function moodInterval(elapsed: number): number {
  const progress = Math.min(1, elapsed / GAME_DURATION);
  const max = 4.2 - progress * 2.6;
  const min = 2.5 - progress * 1.75;
  return Math.max(0.75, min + Math.random() * Math.max(0.3, max - min));
}

function toleranceFor(target: number, elapsed: number): number {
  const progress = Math.min(1, elapsed / GAME_DURATION);
  return Math.max(0.22, target * (0.42 - progress * 0.16));
}

function closenessForSpeed(mood: MoodDef, speed: number, elapsed: number): number {
  const tolerance = toleranceFor(mood.target, elapsed);
  const diff = mood.id === 'zoomies'
    ? Math.max(0, mood.target - speed)
    : Math.abs(speed - mood.target);
  return Math.max(0, 1 - diff / tolerance);
}

export default function PettingCare({ pokemonSprite, pokemonName, onFinish, onExit }: PettingCareProps) {
  const playAreaRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const elapsedRef = useRef(0);
  const nextMoodAtRef = useRef(0);
  const scoreRef = useRef(0);
  const nextXpAtRef = useRef(XP_TICK_SECONDS);
  const popIdRef = useRef(0);
  const finishCalledRef = useRef(false);
  const isTouchingRef = useRef(false);
  const currentSpeedRef = useRef(0);
  const speedSamplesRef = useRef<SpeedSample[]>([]);
  const lastFeedbackAtRef = useRef(0);
  const lastGoodFeedbackAtRef = useRef(0);
  const moodShiftTimeoutRef = useRef<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [, setAccuracy] = useState(0);
  const [mood, setMood] = useState<MoodDef>(() => MOODS[1]);
  const moodRef = useRef<MoodDef>(MOODS[1]);
  const [moodShifting, setMoodShifting] = useState(false);
  const [pops, setPops] = useState<Pop[]>([]);

  const addPop = (x: number, y: number, text: string, kind: Pop['kind']) => {
    const id = ++popIdRef.current;
    const angle = (-155 + Math.random() * 130) * (Math.PI / 180);
    const distance = kind === 'shift' || kind === 'xp' ? 130 : kind === 'good' ? 110 + Math.random() * 58 : 82 + Math.random() * 42;
    const startJitter = kind === 'shift' ? 20 : 34;
    const pop = {
      id,
      x: x + (Math.random() - 0.5) * startJitter,
      y: y - 18 - Math.random() * startJitter,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotate: -24 + Math.random() * 48,
      text,
      kind,
    };
    setPops((list) => [...list.slice(-10), pop]);
    window.setTimeout(() => {
      setPops((list) => list.filter((pop) => pop.id !== id));
    }, 850);
  };

  const addPokemonPop = (text: string, kind: Pop['kind']) => {
    const area = playAreaRef.current?.getBoundingClientRect();
    const sprite = spriteRef.current?.getBoundingClientRect();
    if (!area || !sprite) return;
    addPop(sprite.left - area.left + sprite.width / 2, sprite.top - area.top + sprite.height * 0.22, text, kind);
  };

  const switchMood = (elapsed: number) => {
    const next = randomMood(moodRef.current.id);
    moodRef.current = next;
    setMood(next);
    setMoodShifting(false);
    window.setTimeout(() => setMoodShifting(true), 0);
    if (moodShiftTimeoutRef.current !== null) window.clearTimeout(moodShiftTimeoutRef.current);
    moodShiftTimeoutRef.current = window.setTimeout(() => setMoodShifting(false), 360);
    nextMoodAtRef.current = elapsed + moodInterval(elapsed);
    currentSpeedRef.current = 0;
    speedSamplesRef.current = [];
    setCurrentSpeed(0);
    setAccuracy(0);
    addPokemonPop('✨', 'shift');
  };

  const pointFromEvent = (e: PointerEvent): Point => {
    const area = playAreaRef.current?.getBoundingClientRect();
    const sprite = spriteRef.current?.getBoundingClientRect();
    const x = area ? Math.max(0, Math.min(area.width, e.clientX - area.left)) : 0;
    const y = area ? Math.max(0, Math.min(area.height, e.clientY - area.top)) : 0;
    const pokemonWidth = Math.max(1, sprite?.width ?? 1);
    const onPokemon = !!sprite
      && e.clientX >= sprite.left
      && e.clientX <= sprite.right
      && e.clientY >= sprite.top
      && e.clientY <= sprite.bottom;
    return { x, y, t: performance.now(), onPokemon, pokemonWidth };
  };

  const averageRecentSpeeds = (now: number): number => {
    const cutoff = now - SPEED_AVERAGE_WINDOW_MS;
    const samples = speedSamplesRef.current.filter((sample) => sample.t >= cutoff);
    speedSamplesRef.current = samples;
    if (samples.length === 0) return 0;
    return samples.reduce((sum, sample) => sum + sample.speed, 0) / samples.length;
  };

  const updateRollingSpeed = (now: number): number => {
    const speed = averageRecentSpeeds(now);
    currentSpeedRef.current = speed;
    setCurrentSpeed(speed);
    return speed;
  };

  const scoreStroke = (point: Point, speed: number) => {
    const mood = moodRef.current;
    const closeness = closenessForSpeed(mood, speed, elapsedRef.current);
    setAccuracy(closeness);

    if (closeness <= 0) {
      if (point.t - lastFeedbackAtRef.current > 520) {
        addPop(point.x, point.y, speed < mood.target ? '⚡' : '🐢', 'miss');
        lastFeedbackAtRef.current = point.t;
      }
      return;
    }

    if (point.t - lastGoodFeedbackAtRef.current > 520) {
      addPop(point.x, point.y, closeness > 0.82 ? '💖' : '✨', 'good');
      lastGoodFeedbackAtRef.current = point.t;
    }
  };

  useEffect(() => {
    return () => {
      if (moodShiftTimeoutRef.current !== null) window.clearTimeout(moodShiftTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const el = playAreaRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest('button, input, select, textarea, a')) return;
      if (!started || ended || activePointerIdRef.current !== null) return;
      const point = pointFromEvent(e);
      if (!point.onPokemon) {
        addPop(point.x, point.y, '🐾', 'miss');
        return;
      }
      activePointerIdRef.current = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      isTouchingRef.current = true;
      setIsTouching(true);
      lastPointRef.current = point;
      speedSamplesRef.current = [];
      updateRollingSpeed(point.t);
    };

    const onMove = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      const point = pointFromEvent(e);
      const last = lastPointRef.current;
      lastPointRef.current = point;
      if (!last) return;

      if (!point.onPokemon || !last.onPokemon) {
        speedSamplesRef.current = [];
        updateRollingSpeed(point.t);
        setAccuracy(0);
        return;
      }

      const distance = Math.hypot(point.x - last.x, point.y - last.y);
      if (distance < 3) return;
      const dt = Math.max(16, point.t - last.t) / 1000;
      const instantSpeed = (distance / point.pokemonWidth) / dt;
      speedSamplesRef.current.push({ t: point.t, speed: instantSpeed });
      const speed = updateRollingSpeed(point.t);
      scoreStroke(point, speed);
    };

    const onUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      activePointerIdRef.current = null;
      lastPointRef.current = null;
      isTouchingRef.current = false;
      setIsTouching(false);
      setAccuracy(0);
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [started, ended]);

  useEffect(() => {
    if (!started || ended) return;
    let raf = 0;
    let last = performance.now();
    nextMoodAtRef.current = moodInterval(0);
    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      elapsedRef.current += dt;
      const elapsed = elapsedRef.current;
      if (elapsed >= nextMoodAtRef.current) switchMood(elapsed);
      setTimeLeft(Math.max(0, Math.ceil(GAME_DURATION - elapsed)));
      updateRollingSpeed(now);

      const closeness = closenessForSpeed(moodRef.current, currentSpeedRef.current, elapsed);
      setAccuracy(isTouchingRef.current ? closeness : 0);
      while (nextXpAtRef.current <= Math.min(elapsed, GAME_DURATION)) {
        if (isTouchingRef.current && closenessForSpeed(moodRef.current, currentSpeedRef.current, elapsed) > 0) {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          addPokemonPop('💖', 'xp');
        }
        nextXpAtRef.current += XP_TICK_SECONDS;
      }

      if (elapsed >= GAME_DURATION && !finishCalledRef.current) {
        finishCalledRef.current = true;
        setEnded(true);
        setTimeout(() => onFinish(scoreRef.current), 450);
        return;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, ended, onFinish]);

  const startGame = () => {
    elapsedRef.current = 0;
    scoreRef.current = 0;
    nextXpAtRef.current = XP_TICK_SECONDS;
    currentSpeedRef.current = 0;
    speedSamplesRef.current = [];
    isTouchingRef.current = false;
    finishCalledRef.current = false;
    moodRef.current = MOODS[1];
    nextMoodAtRef.current = moodInterval(0);
    setMood(MOODS[1]);
    setScore(0);
    setCurrentSpeed(0);
    setAccuracy(0);
    setIsTouching(false);
    setTimeLeft(GAME_DURATION);
    setEnded(false);
    setStarted(true);
  };

  const displaySpeed = Math.min(MAX_DISPLAY_SPEED, currentSpeed);
  const targetTolerance = toleranceFor(mood.target, elapsedRef.current);
  const targetRangeStart = Math.max(0, mood.target - targetTolerance);
  const targetRangeEnd = mood.id === 'zoomies'
    ? MAX_DISPLAY_SPEED
    : Math.min(MAX_DISPLAY_SPEED, mood.target + targetTolerance);
  const targetRangeLeft = (targetRangeStart / MAX_DISPLAY_SPEED) * 100;
  const targetRangeWidth = Math.max(2.5, ((targetRangeEnd - targetRangeStart) / MAX_DISPLAY_SPEED) * 100);

  return (
    <div className="petting-root">
      <div className="petting-top">
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onExit}>← Quit</button>
        <div className="petting-status">
          <div className="petting-stat">
            <span className="petting-stat-label">XP</span>
            <span className="petting-stat-value">{score}</span>
          </div>
          <div className="petting-stat">
            <span className="petting-stat-label">Time</span>
            <span className="petting-stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="petting-stage">
        <div
          ref={playAreaRef}
          className={`petting-card mood-${mood.id} ${isTouching ? 'is-touching' : ''} ${moodShifting ? 'is-mood-shifting' : ''}`}
        >
          <div className="petting-target-card" style={{ borderColor: mood.color }}>
            <div
              className="petting-target-fill"
              style={{
                width: `${(displaySpeed / MAX_DISPLAY_SPEED) * 100}%`,
                background: `linear-gradient(90deg, ${mood.color}, rgba(255,255,255,0.2))`,
              }}
            />
            <div
              className="petting-target-marker"
              style={{ left: `${targetRangeLeft}%`, width: `${targetRangeWidth}%` }}
            />
            <div className="petting-target-content">
              <div className="petting-mood-label">{mood.label}</div>
            </div>
          </div>

          <div className="petting-sprite-frame">
            <img ref={spriteRef} src={pokemonSprite} alt={pokemonName} className="petting-sprite" draggable={false} />
          </div>
          <div className="petting-name">{pokemonName}</div>

          {pops.map((pop) => (
            <div
              key={pop.id}
              className={`petting-pop ${pop.kind}`}
              style={{
                left: pop.x,
                top: pop.y,
                '--pop-dx': `${pop.dx}px`,
                '--pop-dy': `${pop.dy}px`,
                '--pop-rotate': `${pop.rotate}deg`,
              } as CSSProperties}
            >
              {pop.text}
            </div>
          ))}

          {!started && (
            <div className="petting-overlay">
              <div className="petting-overlay-title">Gentle Pet</div>
              <div className="petting-overlay-hint">
                Stroke directly on the Pokémon. Match the mood's speed before it changes.
              </div>
              <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={startGame}>Start</button>
            </div>
          )}

          {ended && (
            <div className="petting-overlay">
              <div className="petting-overlay-title">All Done!</div>
              <div className="petting-overlay-score">XP: {score}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
