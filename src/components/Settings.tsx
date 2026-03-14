import React, { useState } from 'react';
import { ArrowLeft, Save, Bell, Layout, Globe, Moon, Sun } from 'lucide-react';
import { translations, type Language } from '../translations';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onBack, 
  theme, 
  toggleTheme, 
  lang, 
  setLang 
}) => {
  const [startPage, setStartPage] = useState<'hub' | 'planner'>(() => {
    return (localStorage.getItem('yt_planner_start_page') as 'hub' | 'planner') || 'hub';
  });
  const [language, setLanguage] = useState<Language>(lang);
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('yt_planner_notifications') !== 'false';
  });
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const t = translations[lang].settings;

  const handleSave = () => {
    localStorage.setItem('yt_planner_start_page', startPage);
    localStorage.setItem('yt_planner_lang', language);
    localStorage.setItem('yt_planner_notifications', String(notifications));
    
    setLang(language); // Apply language globally
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  return (
    <div className="settings-container glass-panel">
      <header className="settings-header">
        <button className="btn-icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2>{t.title}</h2>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h3><Layout size={18} /> {t.view}</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.startPage}</span>
              <span className="item-desc">{t.startPageDesc}</span>
            </div>
            <select 
              value={startPage} 
              onChange={(e) => setStartPage(e.target.value as any)}
              className="settings-select"
            >
              <option value="hub">{t.hub}</option>
              <option value="planner">{t.planner}</option>
            </select>
          </div>

          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.appearance}</span>
              <span className="item-desc">{t.themeDesc}</span>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3><Globe size={18} /> {t.language}</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.language}</span>
              <span className="item-desc">{t.languageDesc}</span>
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
          <h3><Bell size={18} /> {t.notifications}</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.notifications}</span>
              <span className="item-desc">{t.notifDesc}</span>
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
        {showSavedMsg && <span className="save-message">{t.saved}</span>}
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} /> {t.save}
        </button>
      </footer>
    </div>
  );
};
