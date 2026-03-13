import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, Lock, User } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SECRET_INVITE_CODE = 'Schleini-Youtube.Planer';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Internal mapping of username to a virtual email
    const email = `${username.toLowerCase().trim()}@planner.local`;

    try {
      if (isSignUp) {
        if (inviteCode !== SECRET_INVITE_CODE) {
          throw new Error('Ungültiger Einladungscode');
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Account erstellt! Du kannst dich jetzt einloggen.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={32} />
          </div>
          <h1>{isSignUp ? 'Account erstellen' : 'Willkommen zurück'}</h1>
          <p className="auth-subtitle">
            {isSignUp ? 'Registriere dich für den YT Planner' : 'Melde dich an, um fortzufahren'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-group">
            <label>Benutzername</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Dein Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Passwort</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div className="input-group">
              <label>Einladungscode</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Geheim-Code eingeben"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Bitte warten...' : isSignUp ? 'Registrieren' : 'Einloggen'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            className="btn-text" 
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Bereits einen Account? Einloggen' : 'Noch keinen Account? Registrieren'}
          </button>
        </div>
      </div>
    </div>
  );
};
