import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_PATH } from '../config';
import BattleScene from '../components/BattleScene';
import type { BattleSnapshot } from '../../../shared/battle-types';
import './ReplayListScreen.css';

interface ReplayMeta {
  id: string;
  createdAt: string;
  fieldSize: number;
  opponentType: string;
  rounds: number;
  winnerName: string | null;
  loserName: string | null;
}

export default function ReplayWatchScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const [meta, setMeta] = useState<ReplayMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetch(`${BASE_PATH}/api/replay/${id}`)
      .then((r) => r.ok ? r.json() : r.json().then((j) => Promise.reject(new Error(j.error || `HTTP ${r.status}`))))
      .then((data) => { if (alive) { setSnapshot(data.snapshot); setMeta(data.meta); } })
      .catch((e) => { if (alive) setError(e.message || 'failed'); });
    return () => { alive = false; };
  }, [id]);

  const title = meta
    ? `${meta.winnerName ?? 'Unknown'} vs ${meta.loserName ?? 'Unknown'}`
    : 'Replay';

  return (
    <div className="replay-watch">
      <div className="replay-watch-header">
        <button className="replay-back" onClick={() => navigate('/replay')}>← Back</button>
        <div className="replay-watch-title">{title}</div>
      </div>
      <div className="replay-watch-body">
        {error && <div className="replay-empty replay-error">Couldn't load replay: {error}</div>}
        {!error && !snapshot && <div className="replay-empty">Loading replay…</div>}
        {snapshot && <BattleScene snapshot={snapshot} turnDelayMs={1500} />}
      </div>
    </div>
  );
}
