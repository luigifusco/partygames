import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, normalizePartySlug, partyPath } from '../party';
import './PartiesAdmin.css';

interface PartyRow {
  id: string;
  slug: string;
  name: string;
  createdAt?: string;
  stoppedAt?: string | null;
  playerCount: number;
  onlineCount: number;
  tournamentCount: number;
}

export default function PartiesAdmin() {
  const [parties, setParties] = useState<PartyRow[]>([]);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    const res = await fetch(apiUrl('/api/admin/parties'));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? 'Failed to load parties');
    setParties(data.parties ?? []);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    refresh()
      .catch((err) => { if (alive) setError(err.message ?? String(err)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const createParty = async () => {
    const normalizedSlug = normalizePartySlug(slug);
    if (!slug.trim() || normalizedSlug === 'main') {
      setError('Choose a new party slug');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/admin/parties'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: normalizedSlug, name: name.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Could not create party');
        return;
      }
      setSlug('');
      setName('');
      await refresh();
    } catch (err) {
      setError('Could not create party: ' + err);
    } finally {
      setSaving(false);
    }
  };

  const setPartyStopped = async (party: PartyRow, stopped: boolean) => {
    setUpdatingSlug(party.slug);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/admin/parties/${party.slug}/${stopped ? 'stop' : 'start'}`), {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Could not ${stopped ? 'stop' : 'start'} party`);
        return;
      }
      await refresh();
    } catch (err) {
      setError(`Could not ${stopped ? 'stop' : 'start'} party: ` + err);
    } finally {
      setUpdatingSlug(null);
    }
  };

  const formatCreatedAt = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="parties-admin">
      <div className="ds-topbar">
        <div className="admin-topbar-titles">
          <div className="ds-topbar-subtitle">Administrator</div>
          <div className="ds-topbar-title">Parties</div>
        </div>
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={refresh} disabled={loading || saving}>
          Refresh
        </button>
      </div>

      <div className="parties-admin-scroll">
        <div className="ds-card parties-create-card">
          <h3 className="admin-card-title">Create party</h3>
          <p className="parties-admin-hint">Normal players can only join existing party links.</p>
          <div className="parties-create-form">
            <input
              className="ds-input"
              type="text"
              placeholder="party-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={32}
              disabled={saving}
            />
            <input
              className="ds-input"
              type="text"
              placeholder="Display name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              disabled={saving}
            />
            <button className="ds-btn ds-btn-primary" onClick={createParty} disabled={saving || !slug.trim()}>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
          {error && <div className="parties-error">{error}</div>}
        </div>

        <div className="ds-card parties-list-card">
          <h3 className="admin-card-title">Existing parties</h3>
          {loading ? (
            <div className="ds-empty"><div className="ds-empty-text">Loading parties...</div></div>
          ) : parties.length === 0 ? (
            <div className="ds-empty"><div className="ds-empty-text">No parties yet</div></div>
          ) : (
            <div className="parties-list">
              {parties.map((party) => {
                const stopped = !!party.stoppedAt;
                return (
                <div key={party.id} className={`parties-row ${stopped ? 'is-stopped' : ''}`}>
                  <div className="parties-main">
                    <div className="parties-name">
                      {party.name}
                      {stopped && <span className="parties-status">Stopped</span>}
                    </div>
                    <div className="parties-slug">/{party.slug}</div>
                    {party.createdAt && <div className="parties-created">Created {formatCreatedAt(party.createdAt)}</div>}
                    {party.stoppedAt && <div className="parties-created">Stopped {formatCreatedAt(party.stoppedAt)}</div>}
                  </div>
                  <div className="parties-stats">
                    <span>{party.playerCount} players</span>
                    <span>{party.onlineCount} online</span>
                    <span>{party.tournamentCount} tournaments</span>
                  </div>
                  <div className="parties-actions">
                    <Link className="ds-btn ds-btn-sm" to={partyPath('/', party.slug)}>Open</Link>
                    {party.slug !== 'main' && (
                      <button
                        className={`ds-btn ds-btn-sm ${stopped ? 'ds-btn-primary' : 'ds-btn-danger'}`}
                        onClick={() => setPartyStopped(party, !stopped)}
                        disabled={updatingSlug === party.slug}
                      >
                        {stopped ? 'Start' : 'Stop'}
                      </button>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
