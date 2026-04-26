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
  pokemonWidth: number;
}

const GAME_DURATION = 35;
const MAX_DISPLAY_SPEED = 5.5;

const MOODS: MoodDef[] = [
  { id: 'drowsy', label: 'Drowsy', target: 0.8, color: '#98d8ff' },
  { id: 'cozy', label: 'Cozy', target: 1.4, color: '#ffb6dc' },
  { id: 'playful', label: 'Playful', target: 2.2, color: '#ffd35a' },
  { id: 'excited', label: 'Excited', target: 3.4, color: '#ff9a3c' },
  { id: 'zoomies', label: 'Zoomies', target: 4.8, color: '#ff5d7d' },
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

export default function PettingCare({ pokemonSprite, pokemonName, onFinish, onExit }: PettingCareProps) {
  const playAreaRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const elapsedRef = useRef(0);
  const nextMoodAtRef = useRef(0);
  const scoreRef = useRef(0);
  const scoreFloatRef = useRef(0);
  const comboRef = useRef(0);
  const popIdRef = useRef(0);
  const finishCalledRef = useRef(false);
  const isTouchingRef = useRef(false);
  const currentSpeedRef = useRef(0);
  const scorePopupAccRef = useRef(0);
  const lastFeedbackAtRef = useRef(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [, setAccuracy] = useState(0);
  const [mood, setMood] = useState<MoodDef>(() => MOODS[1]);
  const moodRef = useRef<MoodDef>(MOODS[1]);
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
    currentSpeedRef.current = 0;
    scorePopupAccRef.current = 0;
    setCombo(0);
    setCurrentSpeed(0);
    setAccuracy(0);
    const area = playAreaRef.current?.getBoundingClientRect();
    if (area) addPop(area.width / 2, 90, `${next.label}!`, 'shift');
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

  const scoreStroke = (point: Point, speed: number, dt: number) => {
    const target = moodRef.current.target;
    const tolerance = toleranceFor(target, elapsedRef.current);
    const diff = Math.abs(speed - target);
    const closeness = Math.max(0, 1 - diff / tolerance);
    setAccuracy(closeness);

    if (closeness <= 0) {
      comboRef.current = 0;
      setCombo(0);
      if (point.t - lastFeedbackAtRef.current > 520) {
        addPop(point.x, point.y, speed < target ? 'Faster!' : 'Slower!', 'miss');
        lastFeedbackAtRef.current = point.t;
      }
      return;
    }

    comboRef.current = Math.min(99, comboRef.current + dt * 3);
    const comboBonus = Math.min(0.7, comboRef.current / 80);
    const gain = dt * (0.8 + closeness * 1.6 + comboBonus);
    scoreFloatRef.current += gain;
    scorePopupAccRef.current += gain;
    scoreRef.current = Math.floor(scoreFloatRef.current);
    setScore(scoreRef.current);
    setCombo(Math.round(comboRef.current));
    if (scorePopupAccRef.current >= 1) {
      const popupGain = Math.floor(scorePopupAccRef.current);
      scorePopupAccRef.current -= popupGain;
      addPop(point.x, point.y, closeness > 0.75 ? `Perfect +${popupGain}` : `+${popupGain}`, 'good');
    }
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
      scorePopupAccRef.current = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      const point = pointFromEvent(e);
      const last = lastPointRef.current;
      lastPointRef.current = point;
      if (!last) return;

      if (!point.onPokemon || !last.onPokemon) {
        scorePopupAccRef.current = 0;
        currentSpeedRef.current *= 0.7;
        setCurrentSpeed(currentSpeedRef.current);
        setAccuracy(0);
        return;
      }

      const distance = Math.hypot(point.x - last.x, point.y - last.y);
      if (distance < 3) return;
      const dt = Math.max(16, point.t - last.t) / 1000;
      const instantSpeed = (distance / point.pokemonWidth) / dt;
      const speed = currentSpeedRef.current === 0
        ? instantSpeed
        : currentSpeedRef.current * 0.75 + instantSpeed * 0.25;
      currentSpeedRef.current = speed;
      setCurrentSpeed(speed);
      scoreStroke(point, speed, dt);
    };

    const onUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      activePointerIdRef.current = null;
      lastPointRef.current = null;
      scorePopupAccRef.current = 0;
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

      if (!isTouchingRef.current && currentSpeedRef.current > 0) {
        currentSpeedRef.current = Math.max(0, currentSpeedRef.current - 5.5 * dt);
        setCurrentSpeed(currentSpeedRef.current);
      }

      const target = moodRef.current.target;
      const diff = Math.abs(currentSpeedRef.current - target);
      const closeness = Math.max(0, 1 - diff / toleranceFor(target, elapsed));
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
    scoreFloatRef.current = 0;
    comboRef.current = 0;
    scorePopupAccRef.current = 0;
    currentSpeedRef.current = 0;
    isTouchingRef.current = false;
    finishCalledRef.current = false;
    moodRef.current = MOODS[1];
    nextMoodAtRef.current = moodInterval(0);
    setMood(MOODS[1]);
    setScore(0);
    setCombo(0);
    setCurrentSpeed(0);
    setAccuracy(0);
    setIsTouching(false);
    setTimeLeft(GAME_DURATION);
    setEnded(false);
    setStarted(true);
  };

  const displaySpeed = Math.min(MAX_DISPLAY_SPEED, currentSpeed);

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
            <div
              className="petting-target-fill"
              style={{
                width: `${(displaySpeed / MAX_DISPLAY_SPEED) * 100}%`,
                background: `linear-gradient(90deg, ${mood.color}, rgba(255,255,255,0.2))`,
              }}
            />
            <div className="petting-target-content">
              <div className="petting-mood-label">{mood.label}</div>
            </div>
          </div>

          <div className="petting-sprite-frame">
            <img ref={spriteRef} src={pokemonSprite} alt={pokemonName} className="petting-sprite" draggable={false} />
          </div>
          <div className="petting-name">{pokemonName}</div>

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
                Stroke directly on the Pokémon. Match the mood's speed before it changes.
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
