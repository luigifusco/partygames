import './TrickRoomBackground.css';

/* ─── Trick Room Background ──────────────────────────────────────
 *
 * A distinctive geometric/blocky arena that activates while Trick
 * Room is in effect. Unlike the WebGL noise shader used for the
 * default arena, this one is pure CSS: a tiled perspective grid,
 * a crossed laser grid, and a handful of rotating square frames.
 *
 * Rendered as an absolute-fill <div> that can be layered on top of
 * the default BattleBackground and cross-faded in/out.
 */

interface Props {
  active?: boolean;
  className?: string;
}

export default function TrickRoomBackground({ active = true, className }: Props) {
  return (
    <div
      className={`trick-room-bg ${active ? 'active' : ''} ${className ?? ''}`}
      aria-hidden="true"
    >
      <div className="tr-grid tr-grid-floor" />
      <div className="tr-grid tr-grid-ceil" />
      <div className="tr-lattice" />
      <div className="tr-scan" />
      <div className="tr-squares">
        <span className="tr-sq tr-sq1" />
        <span className="tr-sq tr-sq2" />
        <span className="tr-sq tr-sq3" />
        <span className="tr-sq tr-sq4" />
        <span className="tr-sq tr-sq5" />
        <span className="tr-sq tr-sq6" />
      </div>
      <div className="tr-vignette" />
    </div>
  );
}
