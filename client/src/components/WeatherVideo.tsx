import { useEffect, useRef } from 'react';
import { BASE_PATH } from '../config';
import './WeatherVideo.css';

/* Animated weather overlay using looping videos from Pokemon Showdown's
 * fx directory (weather-gen6-{raindance|sunnyday|sandstorm|hail}).
 * The videos are copied into assets-public/fx/ at build time and served
 * locally. Each is blended onto the arena with mix-blend-mode tuned to
 * the type of effect (bright-on-dark → screen, warm → overlay, etc.).
 */

export type WeatherKind = 'rain' | 'sun' | 'sand' | 'hail';

interface Props {
  kind: WeatherKind;
  className?: string;
  style?: React.CSSProperties;
  playbackRate?: number;
}

const FILE_BY_KIND: Record<WeatherKind, string> = {
  rain: 'weather-gen6-raindance',
  sun:  'weather-gen6-sunnyday',
  sand: 'weather-gen6-sandstorm',
  hail: 'weather-gen6-hail',
};

export default function WeatherVideo({ kind, className, style, playbackRate }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const base = FILE_BY_KIND[kind];

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (playbackRate != null) v.playbackRate = Math.max(0.01, playbackRate);
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const onVis = () => { if (!document.hidden) tryPlay(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [kind, playbackRate]);

  return (
    <video
      ref={ref}
      className={`weather-video weather-video-${kind} ${className ?? ''}`}
      style={style}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      key={kind}
    >
      <source src={`${BASE_PATH}/fx/${base}.webm`} type="video/webm" />
      <source src={`${BASE_PATH}/fx/${base}.mp4`} type="video/mp4" />
    </video>
  );
}
