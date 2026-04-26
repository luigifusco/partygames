import { useEffect, useRef, useState } from 'react';
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
  cue: string;
  target: number;
  color: string;
}

interface Pop {
  id: number;
  x: number;
  y: number;
  text: string;
  kind: 'good' | 'miss' | 'shift';
}

interface Point {
  x: number;
  y: number;
  t: number;
  onPokemon: boolean;
}

const GAME_DURATION = 35;
const RHYTHM_WINDOW_MS = 1400;
const MIN_REVERSAL_DISTANCE = 18;

const MOODS: MoodDef[] = [
  { id: 'drowsy', label: 'Drowsy', cue: 'slow strokes', target: 0.7, color: '#98d8ff' },
  { id: 'cozy', label: 'Cozy', cue: 'easy rhythm', target: 1.1, color: '#ffb6dc' },
  { id: 'playful', label: 'Playful', cue: 'keep it moving', target: 1.6, color: '#ffd35a' },
  { id: 'excited', label: 'Excited', cue: 'fast back-and-forth', target: 2.2, color: '#ff9a3c' },
  { id: 'zoomies', label: 'Zoomies', cue: 'nearly impossible!', target: 3.0, color: '#ff5d7d' },
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

function toleranceFor(elapsed: number): number {
  const progress = Math.min(1, elapsed / GAME_DURATION);
  return 0.42 - progress * 0.18;
}

export default function PettingCare({ pokemonSprite, pokemonName, onFinish, onExit }: PettingCareProps) {
  const playAreaRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const directionRef = useRef<-1 | 0 | 1>(0);
  const directionDistanceRef = useRef(0);
  const reversalTimesRef = useRef<number[]>([]);
  const elapsedRef = useRef(0);
  const nextMoodAtRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const popIdRef = useRef(0);
  const finishCalledRef = useRef(false);
  const isTouchingRef = useRef(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [currentRhythm, setCurrentRhythm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [mood, setMood] = useState<MoodDef>(() => MOODS[1]);
  const moodRef = useRef<MoodDef>(MOODS[1]);
  const [nextMoodIn, setNextMoodIn] = useState(0);
  const [pops, setPops] = useState<Pop[]>([]);

  const addPop = (x: number, y: number, text: string, kind: Pop['kind']) => {
    const id = ++popIdRef.current;
    setPops((list) => [...list.slice(-10), { id, x, y, text, kind }]);
    window.setTimeout(() => {
      setPops((list) => list.filter((pop) => pop.id !== id));
    }, 850);
  };

  const switchMood = (elapsed: number) => {
    const next = randomMood(moodRef.current.id);
    moodRef.current = next;
    setMood(next);
    nextMoodAtRef.current = elapsed + moodInterval(elapsed);
    comboRef.current = 0;
    setCombo(0);
    reversalTimesRef.current = [];
    setCurrentRhythm(0);
    setAccuracy(0);
    const area = playAreaRef.current?.getBoundingClientRect();
    if (area) addPop(area.width / 2, 90, `${next.label}!`, 'shift');
  };

  const pointFromEvent = (e: PointerEvent): Point => {
    const area = playAreaRef.current?.getBoundingClientRect();
    const sprite = spriteRef.current?.getBoundingClientRect();
    const x = area ? Math.max(0, Math.min(area.width, e.clientX - area.left)) : 0;
    const y = area ? Math.max(0, Math.min(area.height, e.clientY - area.top)) : 0;
    const onPokemon = !!sprite
      && e.clientX >= sprite.left
      && e.clientX <= sprite.right
      && e.clientY >= sprite.top
      && e.clientY <= sprite.bottom;
    return { x, y, t: performance.now(), onPokemon };
  };

  const currentBackAndForths = (now: number) => {
    const cutoff = now - RHYTHM_WINDOW_MS;
    reversalTimesRef.current = reversalTimesRef.current.filter((t) => t >= cutoff);
    return (reversalTimesRef.current.length / 2) / (RHYTHM_WINDOW_MS / 1000);
  };

  const scoreReversal = (point: Point, rhythm: number) => {
    const target = moodRef.current.target;
    const tolerance = toleranceFor(elapsedRef.current);
    const diff = Math.abs(rhythm - target);
    const closeness = Math.max(0, 1 - diff / tolerance);
    setCurrentRhythm(rhythm);
    setAccuracy(closeness);

    if (closeness <= 0) {
      comboRef.current = 0;
      setCombo(0);
      addPop(point.x, point.y, rhythm < target ? 'Faster!' : 'Slower!', 'miss');
      return;
    }

    comboRef.current = Math.min(99, comboRef.current + 1);
    const gain = Math.max(1, Math.round(2 + closeness * 5 + Math.floor(comboRef.current / 8)));
    scoreRef.current += gain;
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    addPop(point.x, point.y, closeness > 0.72 ? `Perfect +${gain}` : `+${gain}`, 'good');
  };

  useEffect(() => {
    const el = playAreaRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest('button, input, select, textarea, a')) return;
      if (!started || ended || activePointerIdRef.current !== null) return;
      const point = pointFromEvent(e);
      if (!point.onPokemon) {
        addPop(point.x, point.y, 'Pet the Pokémon!', 'miss');
        return;
      }
      activePointerIdRef.current = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      isTouchingRef.current = true;
      setIsTouching(true);
      lastPointRef.current = point;
      directionRef.current = 0;
      directionDistanceRef.current = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      const point = pointFromEvent(e);
      const last = lastPointRef.current;
      lastPointRef.current = point;
      if (!last) return;

      if (!point.onPokemon || !last.onPokemon) {
        directionDistanceRef.current = 0;
        setAccuracy(0);
        return;
      }

      const dx = point.x - last.x;
      const absDx = Math.abs(dx);
      if (absDx < 2) return;
      const nextDirection: -1 | 1 = dx > 0 ? 1 : -1;

      if (directionRef.current === 0) {
        directionRef.current = nextDirection;
        directionDistanceRef.current = absDx;
        return;
      }

      if (nextDirection === directionRef.current) {
        directionDistanceRef.current += absDx;
        return;
      }

      if (directionDistanceRef.current >= MIN_REVERSAL_DISTANCE) {
        reversalTimesRef.current.push(point.t);
        const rhythm = currentBackAndForths(point.t);
        scoreReversal(point, rhythm);
      }
      directionRef.current = nextDirection;
      directionDistanceRef.current = absDx;
    };

    const onUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      activePointerIdRef.current = null;
      lastPointRef.current = null;
      directionRef.current = 0;
      directionDistanceRef.current = 0;
      isTouchingRef.current = false;
      setIsTouching(false);
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
      setNextMoodIn(Math.max(0, nextMoodAtRef.current - elapsed));

      const rhythm = currentBackAndForths(now);
      setCurrentRhythm(rhythm);
      const diff = Math.abs(rhythm - moodRef.current.target);
      const closeness = Math.max(0, 1 - diff / toleranceFor(elapsed));
      setAccuracy(isTouchingRef.current ? closeness : 0);

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
    comboRef.current = 0;
    reversalTimesRef.current = [];
    directionRef.current = 0;
    directionDistanceRef.current = 0;
    isTouchingRef.current = false;
    finishCalledRef.current = false;
    moodRef.current = MOODS[1];
    nextMoodAtRef.current = moodInterval(0);
    setMood(MOODS[1]);
    setScore(0);
    setCombo(0);
    setCurrentRhythm(0);
    setAccuracy(0);
    setIsTouching(false);
    setTimeLeft(GAME_DURATION);
    setEnded(false);
    setStarted(true);
  };

  return (
    <div className="petting-root">
      <div className="petting-top">
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onExit}>← Quit</button>
        <div className="petting-status">
          <div className="petting-stat">
            <span className="petting-stat-label">Score</span>
            <span className="petting-stat-value">{score}</span>
          </div>
          <div className="petting-stat">
            <span className="petting-stat-label">Time</span>
            <span className="petting-stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="petting-stage">
        <div ref={playAreaRef} className={`petting-card mood-${mood.id} ${isTouching ? 'is-touching' : ''}`}>
          <div className="petting-target-card" style={{ borderColor: mood.color }}>
            <div className="petting-mood-label" style={{ color: mood.color }}>{mood.label}</div>
            <div className="petting-mood-cue">{mood.cue}</div>
            <div className="petting-target-rate">{mood.target.toFixed(1)} back-and-forths / sec</div>
          </div>

          <div className="petting-sprite-frame">
            <img ref={spriteRef} src={pokemonSprite} alt={pokemonName} className="petting-sprite" draggable={false} />
          </div>
          <div className="petting-name">{pokemonName}</div>

          <div className="petting-rhythm-panel">
            <div className="petting-rhythm-row">
              <span>Your rhythm</span>
              <strong>{currentRhythm.toFixed(1)}/s</strong>
            </div>
            <div className="petting-rhythm-track">
              <div className="petting-rhythm-band" style={{ left: `${Math.min(100, (mood.target / 3.4) * 100)}%` }} />
              <div className="petting-rhythm-fill" style={{ width: `${Math.min(100, (currentRhythm / 3.4) * 100)}%` }} />
            </div>
            <div className="petting-rhythm-row small">
              <span>Match</span>
              <strong>{Math.round(accuracy * 100)}%</strong>
            </div>
            <div className="petting-accuracy-track">
              <div className="petting-accuracy-fill" style={{ width: `${Math.round(accuracy * 100)}%`, background: mood.color }} />
            </div>
          </div>

          <div className="petting-countdown">
            Mood changes in <strong>{nextMoodIn.toFixed(1)}s</strong>
          </div>
          {combo >= 3 && <div className="petting-combo">Combo ×{Math.min(5, 1 + Math.floor(combo / 6))}</div>}

          {pops.map((pop) => (
            <div key={pop.id} className={`petting-pop ${pop.kind}`} style={{ left: pop.x, top: pop.y }}>
              {pop.text}
            </div>
          ))}

          {!started && (
            <div className="petting-overlay">
              <div className="petting-overlay-title">Gentle Pet</div>
              <div className="petting-overlay-hint">
                Stroke back and forth directly on the Pokémon. Match the mood's rhythm before it changes.
              </div>
              <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={startGame}>Start</button>
            </div>
          )}

          {ended && (
            <div className="petting-overlay">
              <div className="petting-overlay-title">All Done!</div>
              <div className="petting-overlay-score">Score: {score}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
