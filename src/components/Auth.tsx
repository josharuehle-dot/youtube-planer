import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Key } from 'lucide-react';
import { translations, type Language } from '../translations';

interface AuthProps {
  onUnlock: () => void;
  lang: Language;
  customLogo: string | null;
}

export const Auth: React.FC<AuthProps> = ({ onUnlock, lang, customLogo }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang].auth;

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
        setError(t.errorInvalid);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(t.errorDB);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">
            <img 
              src={customLogo || undefined} 
              alt="" 
              style={{ display: customLogo ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'contain' }} 
            />
            {!customLogo && <Key size={32} />}
          </div>
          <h1>{t.title}</h1>
          <p className="auth-subtitle">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="auth-form">
          <div className="input-group">
            <label>{t.passwordLabel}</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t.loading : t.unlock}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {t.footer}
          </p>
        </div>
      </div>
    </div>
  );
};
