import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BattleBackground, { BACKGROUND_PRESETS } from '../components/BattleBackground';
import '../components/BattleScene.css';
import './WeatherTuner.css';

type WeatherKind = 'rain' | 'sun' | 'sand' | 'hail';

interface WeatherDef {
  kind: WeatherKind;
  label: string;
  icon: string;
  description: string;
}

const WEATHERS: WeatherDef[] = [
  { kind: 'rain', label: 'Rain',       icon: '🌧️', description: 'Tinted wash + diagonal streaks + subtle lightning' },
  { kind: 'sun',  label: 'Harsh Sun',  icon: '☀️', description: 'Warm pulse + rotating rays + heat haze' },
  { kind: 'sand', label: 'Sandstorm',  icon: '🌪️', description: 'Tan haze + wind-blown streaks + drifting motes' },
  { kind: 'hail', label: 'Hail',       icon: '❄️', description: 'Icy tint + falling flakes' },
];

export default function WeatherTuner() {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [saturate, setSaturate] = useState(1);
  const [paused, setPaused] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [focus, setFocus] = useState<WeatherKind | null>(null);

  // Per-preview pseudo-element durations come from CSS. To tune speed we
  // inject a <style> block that scales every weather animation by 1/speed.
  // Using a CSS custom property is simpler than overriding each rule.
  const speedStyle = useMemo(() => {
    const s = Math.max(0.01, speed);
    // List every weather animation + its base duration (must match BattleScene.css).
    const rules: Array<[string, number]> = [
      ['.weather-overlay-rain::before', 0.7], // front streaks
      ['.weather-overlay-rain',         9],   // lightning flash (on element)
      ['.weather-overlay-rain::after',  7],   // lightning flash (pseudo)
      ['.weather-overlay-sun',          3.5], // sun pulse
      ['.weather-overlay-sun::before',  28],  // sun rays
      ['.weather-overlay-sun::after',   2.2], // heat haze
      ['.weather-overlay-sand::before', 1.8], // sand front
      ['.weather-overlay-sand::after',  5],   // sand dust
      ['.weather-overlay-hail::before', 1.0],
      ['.weather-overlay-hail::after',  1.8],
    ];
    // We can't retarget the double-animation on rain::before reliably with a
    // single duration, so override it explicitly with both durations.
    let css = '';
    for (const [sel, base] of rules) {
      css += `.weather-tuner-scope ${sel} { animation-duration: ${(base / s).toFixed(3)}s; }\n`;
    }
    // Rain::before has TWO animations (front 0.7s, back 1.4s); redefine both.
    css += `.weather-tuner-scope .weather-overlay-rain::before { animation-duration: ${(0.7 / s).toFixed(3)}s, ${(1.4 / s).toFixed(3)}s; }\n`;
    // Sand::before also has two (1.8s front, 3.6s back).
    css += `.weather-tuner-scope .weather-overlay-sand::before { animation-duration: ${(1.8 / s).toFixed(3)}s, ${(3.6 / s).toFixed(3)}s; }\n`;
    if (paused) {
      css += `.weather-tuner-scope .weather-overlay, .weather-tuner-scope .weather-overlay::before, .weather-tuner-scope .weather-overlay::after { animation-play-state: paused !important; }\n`;
    }
    return css;
  }, [speed, paused]);

  const overlayStyle: React.CSSProperties = {
    opacity,
    filter: `brightness(${brightness}) saturate(${saturate})`,
  };

  const preset = BACKGROUND_PRESETS[bgIndex % BACKGROUND_PRESETS.length];

  const Preview = ({ w, big = false }: { w: WeatherDef; big?: boolean }) => (
    <div
      className={`weather-card ${big ? 'big' : ''}`}
      onClick={() => !big && setFocus(w.kind)}
      role={big ? undefined : 'button'}
      tabIndex={big ? -1 : 0}
    >
      <div className="weather-card-stage weather-tuner-scope">
        <BattleBackground preset={preset} />
        <div className={`weather-overlay weather-overlay-${w.kind}`} style={overlayStyle} />
      </div>
      <div className="weather-card-label">
        <span className="weather-card-icon">{w.icon}</span>
        <div className="weather-card-meta">
          <div className="weather-card-name">{w.label}</div>
          <div className="weather-card-desc">{w.description}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="weather-tuner-screen">
      <style>{speedStyle}</style>
      <div className="weather-tuner-header">
        <button className="weather-back" onClick={() => navigate(-1)}>← Back</button>
        <h2>Weather Tuner</h2>
      </div>

      <div className="weather-controls">
        <div className="weather-control">
          <label>Opacity <span>{opacity.toFixed(2)}</span></label>
          <input type="range" min="0" max="1.5" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
        </div>
        <div className="weather-control">
          <label>Speed <span>{speed.toFixed(2)}×</span></label>
          <input type="range" min="0.1" max="3" step="0.05" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
        </div>
        <div className="weather-control">
          <label>Brightness <span>{brightness.toFixed(2)}</span></label>
          <input type="range" min="0.5" max="1.8" step="0.05" value={brightness} onChange={(e) => setBrightness(+e.target.value)} />
        </div>
        <div className="weather-control">
          <label>Saturation <span>{saturate.toFixed(2)}</span></label>
          <input type="range" min="0" max="2" step="0.05" value={saturate} onChange={(e) => setSaturate(+e.target.value)} />
        </div>
        <div className="weather-control weather-control-row">
          <button className="weather-btn" onClick={() => setPaused((p) => !p)}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className="weather-btn" onClick={() => setBgIndex((i) => i + 1)}>
            🔀 Shuffle BG
          </button>
          <button
            className="weather-btn"
            onClick={() => {
              setOpacity(1); setSpeed(1); setBrightness(1); setSaturate(1); setPaused(false);
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="weather-grid">
        {WEATHERS.map((w) => (
          <Preview key={w.kind} w={w} />
        ))}
      </div>

      <div className="weather-footnote">
        Background preset: <b>{preset.label}</b> · Tap a card to expand.
      </div>

      {focus && (
        <div className="weather-focus-overlay" onClick={() => setFocus(null)}>
          <div className="weather-focus-card" onClick={(e) => e.stopPropagation()}>
            <button className="weather-focus-close" onClick={() => setFocus(null)}>✕</button>
            <Preview w={WEATHERS.find((w) => w.kind === focus)!} big />
          </div>
        </div>
      )}
    </div>
  );
}
