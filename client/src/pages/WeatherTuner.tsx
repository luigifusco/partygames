import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BattleBackground, { BACKGROUND_PRESETS } from '../components/BattleBackground';
import WeatherVideo, { type WeatherKind } from '../components/WeatherVideo';
import '../components/BattleScene.css';
import './WeatherTuner.css';

interface WeatherDef {
  kind: WeatherKind;
  label: string;
  icon: string;
  description: string;
}

const WEATHERS: WeatherDef[] = [
  { kind: 'rain', label: 'Rain',      icon: '🌧️', description: 'weather-gen6-raindance' },
  { kind: 'sun',  label: 'Harsh Sun', icon: '☀️', description: 'weather-gen6-sunnyday' },
  { kind: 'sand', label: 'Sandstorm', icon: '🌪️', description: 'weather-gen6-sandstorm' },
  { kind: 'hail', label: 'Hail',      icon: '❄️', description: 'weather-gen6-hail' },
];

const BLEND_MODES = ['screen', 'multiply', 'overlay', 'lighten', 'normal'] as const;

export default function WeatherTuner() {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [saturate, setSaturate] = useState(1);
  const [blend, setBlend] = useState<string>('default');
  const [bgIndex, setBgIndex] = useState(0);
  const [focus, setFocus] = useState<WeatherKind | null>(null);

  const style = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {
      opacity,
      filter: `brightness(${brightness}) saturate(${saturate})`,
    };
    if (blend !== 'default') (s as any).mixBlendMode = blend;
    return s;
  }, [opacity, brightness, saturate, blend]);

  const preset = BACKGROUND_PRESETS[bgIndex % BACKGROUND_PRESETS.length];

  const Preview = ({ w, big = false }: { w: WeatherDef; big?: boolean }) => (
    <div
      className={`weather-card ${big ? 'big' : ''}`}
      onClick={() => !big && setFocus(w.kind)}
      role={big ? undefined : 'button'}
      tabIndex={big ? -1 : 0}
    >
      <div className="weather-card-stage">
        <BattleBackground preset={preset} />
        <WeatherVideo kind={w.kind} style={style} playbackRate={speed} />
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
        <div className="weather-control">
          <label>Blend mode</label>
          <select className="weather-select" value={blend} onChange={(e) => setBlend(e.target.value)}>
            <option value="default">default (per-weather)</option>
            {BLEND_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="weather-control weather-control-row">
          <button className="weather-btn" onClick={() => setBgIndex((i) => i + 1)}>🔀 Shuffle BG</button>
          <button
            className="weather-btn"
            onClick={() => { setOpacity(1); setSpeed(1); setBrightness(1); setSaturate(1); setBlend('default'); }}
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
        Background preset: <b>{preset.label}</b> · Tap a card to expand. Videos from
        {' '}<code>play.pokemonshowdown.com/fx/</code>.
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
