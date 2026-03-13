import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Key } from 'lucide-react';

interface AuthProps {
  onUnlock: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onUnlock }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check password against app_config table
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'team_password')
        .single();

      if (error) throw error;

      if (data && data.value === password) {
        // Correct password
        sessionStorage.setItem('team_unlocked', 'true');
        onUnlock();
      } else {
        setError('Ungültiges Passwort');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('Verbindungsfehler zur Datenbank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">
            <Key size={32} />
          </div>
          <h1>Team Zugang</h1>
          <p className="auth-subtitle">
            Bitte gib das Team-Passwort ein, um den Planer zu öffnen.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="auth-form">
          <div className="input-group">
            <label>Passwort</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Team-Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Prüfe...' : 'Entsperren'}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Nur für autorisierte Teammitglieder.
          </p>
        </div>
      </div>
    </div>
  );
};
