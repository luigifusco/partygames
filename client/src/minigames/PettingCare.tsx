import { useEffect, useRef, useState } from 'react';
import './PettingCare.css';

interface PettingCareProps {
  pokemonSprite: string;
  pokemonName: string;
  onFinish: (score: number) => void;
  onExit: () => void;
}

type Mood = 'calm' | 'happy' | 'overstimulated';

const GAME_DURATION = 30;

export default function PettingCare({ pokemonSprite, pokemonName, onFinish, onExit }: PettingCareProps) {
  const petAreaRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const scoreRef = useRef(0);
  const comfortRef = useRef(24);
  const overstimRef = useRef(0);
  const comboRef = useRef(0);
  const [score, setScore] = useState(0);
  const [comfort, setComfort] = useState(24);
  const [overstim, setOverstim] = useState(0);
  const [combo, setCombo] = useState(0);
  const [mood, setMood] = useState<Mood>('calm');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const heartIdRef = useRef(0);

  const syncMeters = () => {
    setComfort(Math.round(comfortRef.current));
    setOverstim(Math.round(overstimRef.current));
    const nextMood: Mood = overstimRef.current > 62 ? 'overstimulated' : comfortRef.current > 68 ? 'happy' : 'calm';
    setMood(nextMood);
  };

  const addHeart = (x: number, y: number, text: string) => {
    const id = ++heartIdRef.current;
    setHearts((list) => [...list.slice(-9), { id, x, y, text }]);
    window.setTimeout(() => {
      setHearts((list) => list.filter((h) => h.id !== id));
    }, 800);
  };

  const awardPet = (x: number, y: number, distance: number, speed: number) => {
    if (!started || ended) return;
    if (speed > 1450) {
      overstimRef.current = Math.min(100, overstimRef.current + 11);
      comfortRef.current = Math.max(0, comfortRef.current - 2);
      comboRef.current = 0;
      setCombo(0);
      addHeart(x, y, 'Too fast!');
      syncMeters();
      return;
    }

    const isSweetStroke = speed >= 70 && speed <= 760;
    if (!isSweetStroke || overstimRef.current > 72) {
      overstimRef.current = Math.max(0, overstimRef.current - 1.5);
      syncMeters();
      return;
    }

    comboRef.current = Math.min(20, comboRef.current + 1);
    const comboBonus = 1 + Math.floor(comboRef.current / 6);
    const gain = Math.max(1, Math.min(5, Math.round(distance / 28) + comboBonus));
    scoreRef.current += gain;
    comfortRef.current = Math.min(100, comfortRef.current + distance * 0.045 + comboBonus);
    overstimRef.current = Math.max(0, overstimRef.current - 3);
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    addHeart(x, y, `+${gain}`);
    syncMeters();
  };

  useEffect(() => {
    const el = petAreaRef.current;
    if (!el) return;

    const localPoint = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
        t: performance.now(),
      };
    };

    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest('button, input, select, textarea, a')) return;
      if (!started || ended || activePointerIdRef.current !== null) return;
      activePointerIdRef.current = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      const point = localPoint(e);
      lastPointRef.current = point;
      comfortRef.current = Math.min(100, comfortRef.current + 1.5);
      addHeart(point.x, point.y, '♡');
      syncMeters();
    };

    const onMove = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      const point = localPoint(e);
      const last = lastPointRef.current;
      lastPointRef.current = point;
      if (!last) return;
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const distance = Math.hypot(dx, dy);
      const dt = Math.max(16, point.t - last.t);
      const speed = (distance / dt) * 1000;
      if (distance >= 4) awardPet(point.x, point.y, distance, speed);
    };

    const onUp = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return;
      activePointerIdRef.current = null;
      lastPointRef.current = null;
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
    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      overstimRef.current = Math.max(0, overstimRef.current - 12 * dt);
      comfortRef.current = Math.max(0, comfortRef.current - 1.8 * dt);
      if (overstimRef.current < 35 && comboRef.current > 0) {
        comboRef.current = Math.max(0, comboRef.current - 0.8 * dt);
        setCombo(Math.round(comboRef.current));
      }
      syncMeters();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, ended]);

  useEffect(() => {
    if (!started || ended) return;
    if (timeLeft <= 0) {
      setEnded(true);
      setTimeout(() => onFinish(scoreRef.current), 450);
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [started, ended, timeLeft, onFinish]);

  const moodLabel = mood === 'happy' ? 'Happy!' : mood === 'overstimulated' ? 'Too excited' : 'Calm';

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
        <div ref={petAreaRef} className={`petting-card mood-${mood}`}>
          <div className="petting-mood-pill">{moodLabel}</div>
          <div className="petting-sprite-frame">
            <img src={pokemonSprite} alt={pokemonName} className="petting-sprite" draggable={false} />
          </div>
          <div className="petting-name">{pokemonName}</div>

          <div className="petting-meters">
            <div className="petting-meter">
              <div className="petting-meter-label">Comfort</div>
              <div className="petting-meter-track">
                <div className="petting-meter-fill comfort" style={{ width: `${comfort}%` }} />
              </div>
            </div>
            <div className="petting-meter">
              <div className="petting-meter-label">Excitement</div>
              <div className="petting-meter-track">
                <div className="petting-meter-fill excitement" style={{ width: `${overstim}%` }} />
              </div>
            </div>
          </div>

          {combo >= 4 && <div className="petting-combo">Gentle combo ×{Math.min(4, 1 + Math.floor(combo / 6))}</div>}

          {hearts.map((heart) => (
            <div key={heart.id} className={heart.text === 'Too fast!' ? 'petting-pop warning' : 'petting-pop'} style={{ left: heart.x, top: heart.y }}>
              {heart.text}
            </div>
          ))}

          {!started && (
            <div className="petting-overlay">
              <div className="petting-overlay-title">Gentle Pet</div>
              <div className="petting-overlay-hint">
                Use slow, smooth strokes over your Pokémon. If it gets too excited, pause for a moment.
              </div>
              <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={() => setStarted(true)}>Start</button>
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
