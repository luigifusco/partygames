import { useEffect, useRef } from 'react';
import { BASE_PATH } from '../config';
import './WeatherVideo.css';

/* Animated weather overlay using looping videos from Pokemon Showdown's
 * fx directory (weather-gen6-{raindance|sunnyday|sandstorm|hail}).
 * The videos are served locally from assets-public/fx/.
 *
 * iOS Safari quirks handled here:
 * - The `muted` attribute must be present at parse time for autoplay to
 *   be allowed. React's JSX `muted` prop is set as a property, not an
 *   attribute, so we also call setAttribute('muted', '') in the ref
 *   callback.
 * - `mix-blend-mode` is ignored on `<video>` on iOS because the video
 *   composites in a separate hardware layer. We put the blend mode on
 *   a wrapper `<div>` instead and let the video paint inside it.
 * - MP4 is listed before WebM so iOS picks the H.264 source without
 *   stumbling on the unsupported webm source.
 * - `webkit-playsinline` (legacy attribute) is included alongside
 *   `playsInline` for older iOS.
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
    // Force muted attribute (not just property) for iOS autoplay.
    v.setAttribute('muted', '');
    v.setAttribute('webkit-playsinline', 'true');
    v.setAttribute('playsinline', 'true');
    v.muted = true;
    v.defaultMuted = true;
    if (playbackRate != null) v.playbackRate = Math.max(0.01, playbackRate);
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    tryPlay();
    // iOS pauses videos when the tab loses focus or a modal closes —
    // retry on every reasonable signal.
    const onVis = () => { if (!document.hidden) tryPlay(); };
    const onTouch = () => tryPlay();
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('touchstart', onTouch, { once: true, passive: true });
    document.addEventListener('click', onTouch, { once: true });
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('click', onTouch);
    };
  }, [kind, playbackRate]);

  return (
    <div
      className={`weather-video-wrap weather-video-wrap-${kind} ${className ?? ''}`}
      style={style}
      aria-hidden="true"
    >
      <video
        ref={ref}
        className={`weather-video weather-video-${kind}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        key={kind}
      >
        {/* MP4 first so iOS picks a format it actually supports. */}
        <source src={`${BASE_PATH}/fx/${base}.mp4`} type="video/mp4" />
        <source src={`${BASE_PATH}/fx/${base}.webm`} type="video/webm" />
      </video>
    </div>
  );
}
