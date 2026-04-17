import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_PATH } from '../config';
import './LoginScreen.css';

interface PlayerData {
  id: string;
  name: string;
  essence: number;
  elo: number;
}

interface LoginScreenProps {
  onLogin: (player: PlayerData, pokemonRows: any[], itemRows: any[], recentPokemonIds?: number[]) => void;
}

const API_BASE = BASE_PATH;

const LAST_PLAYER_KEY = 'lastPlayerName';

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem(LAST_PLAYER_KEY) ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    fetch(API_BASE + '/api/settings/features')
      .then(r => r.json())
      .then(data => { setLoginDisabled(data.loginDisabled ?? false); setCheckingStatus(false); })
      .catch(() => setCheckingStatus(false));
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      localStorage.setItem(LAST_PLAYER_KEY, name.trim());
      onLogin(data.player, [], []);
      navigate('/play');
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      localStorage.setItem(LAST_PLAYER_KEY, name.trim());
      const pokemonRows = data.pokemon;
      const itemRows = data.items ?? [];
      onLogin(data.player, pokemonRows, itemRows, data.recentPokemonIds);
      navigate('/play');
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  if (checkingStatus) {
    return <div className="login-screen"><div className="ds-spinner" aria-label="Loading" /></div>;
  }

  if (loginDisabled) {
    return (
      <div className="login-screen splash-screen">
        <div className="splash-glow" />
        <div className="splash-content">
          <div className="splash-icon">⚡</div>
          <h1 className="splash-title">Pokémon Party</h1>
          <div className="splash-subtitle">The party is about to begin</div>
          <div className="splash-dots">
            <span className="splash-dot" />
            <span className="splash-dot" />
            <span className="splash-dot" />
          </div>
          <div className="splash-hint">Get ready, trainers!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <h1>⚡ Pokémon Party</h1>
      <div className="login-form">
        <input
          className="ds-input login-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          maxLength={20}
          disabled={loading}
        />
        <div className="login-buttons">
          <button
            className="ds-btn ds-btn-primary"
            onClick={handleLogin}
            disabled={!name.trim() || loading}
          >
            Login
          </button>
          <button
            className="ds-btn"
            onClick={handleRegister}
            disabled={!name.trim() || loading}
          >
            Register
          </button>
        </div>
        {error && <div className="login-error">{error}</div>}
        <div className="login-info">No password needed — just pick a name!</div>
      </div>
    </div>
  );
}
