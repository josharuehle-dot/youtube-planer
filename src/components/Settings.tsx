import React, { useState } from 'react';
import { ArrowLeft, Save, Bell, Layout, Globe, Moon, Sun } from 'lucide-react';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack, theme, toggleTheme }) => {
  const [startPage, setStartPage] = useState<'hub' | 'planner'>(() => {
    return (localStorage.getItem('yt_planner_start_page') as 'hub' | 'planner') || 'hub';
  });
  const [language, setLanguage] = useState<'de' | 'en'>(() => {
    return (localStorage.getItem('yt_planner_lang') as 'de' | 'en') || 'de';
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('yt_planner_notifications') !== 'false';
  });
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSave = () => {
    localStorage.setItem('yt_planner_start_page', startPage);
    localStorage.setItem('yt_planner_lang', language);
    localStorage.setItem('yt_planner_notifications', String(notifications));
    
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  return (
    <div className="settings-container glass-panel">
      <header className="settings-header">
        <button className="btn-icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2>Einstellungen</h2>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h3><Layout size={18} /> Ansicht</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">Standard-Startseite</span>
              <span className="item-desc">Wähle welche Seite nach dem Login angezeigt wird.</span>
            </div>
            <select 
              value={startPage} 
              onChange={(e) => setStartPage(e.target.value as any)}
              className="settings-select"
            >
              <option value="hub">Team Hub</option>
              <option value="planner">Content Planner</option>
            </select>
          </div>

          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">Erscheinungsbild</span>
              <span className="item-desc">Wechsle zwischen Dark und Light Mode.</span>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3><Globe size={18} /> Sprache</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">Sprache</span>
              <span className="item-desc">Stelle die Systemsprache ein.</span>
            </div>
            <div className="settings-toggle-group">
              <button 
                className={`toggle-btn ${language === 'de' ? 'active' : ''}`}
                onClick={() => setLanguage('de')}
              >
                Deutsch
              </button>
              <button 
                className={`toggle-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3><Bell size={18} /> Benachrichtigungen</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">Planungs-Erinnerungen</span>
              <span className="item-desc">Erhalte Benachrichtigungen für anstehende Uploads.</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </section>
      </div>

      <footer className="settings-footer">
        {showSavedMsg && <span className="save-message">Einstellungen gespeichert!</span>}
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} /> Speichern
        </button>
      </footer>
    </div>
  );
};
