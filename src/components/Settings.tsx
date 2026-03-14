import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Save, Bell, Layout, Globe, Moon, Sun, 
  Youtube, Key, Mail, Smartphone, ChevronDown, Check
} from 'lucide-react';
import { translations, type Language } from '../translations';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  ytApiKey: string;
  setYtApiKey: (val: string) => void;
  ytChannelLink: string;
  setYtChannelLink: (val: string) => void;
  twitchLink: string;
  setTwitchLink: (val: string) => void;
  customLogo: string | null;
  setCustomLogo: (val: string | null) => void;
}

// Custom Premium Select Component
const CustomSelect: React.FC<{
  label: string; // Used for identifying the component (optional)
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}> = ({ label: _label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-select-container" ref={containerRef}>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </div>
      {isOpen && (
        <div className="custom-select-options">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`custom-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {opt.value === value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Settings: React.FC<SettingsProps> = ({ 
  onBack, 
  theme, 
  toggleTheme, 
  lang, 
  setLang,
  ytApiKey,
  setYtApiKey,
  ytChannelLink,
  setYtChannelLink,
  twitchLink,
  setTwitchLink,
  customLogo,
  setCustomLogo
}) => {
  const [startPage, setStartPage] = useState<'hub' | 'planner'>(() => {
    return (localStorage.getItem('yt_planner_start_page') as 'hub' | 'planner') || 'hub';
  });
  const [language, setLanguage] = useState<Language>(lang);
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem('yt_planner_email_notif') === 'true');
  const [browserNotif, setBrowserNotif] = useState(() => localStorage.getItem('yt_planner_browser_notif') !== 'false');
  
  const [tempApiKey, setTempApiKey] = useState(ytApiKey);
  const [tempChannelLink, setTempChannelLink] = useState(ytChannelLink);
  const [tempTwitchLink, setTempTwitchLink] = useState(twitchLink);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const t = translations[lang].settings;

  const handleSave = () => {
    localStorage.setItem('yt_planner_start_page', startPage);
    localStorage.setItem('yt_planner_lang', language);
    localStorage.setItem('yt_planner_email_notif', String(emailNotif));
    localStorage.setItem('yt_planner_browser_notif', String(browserNotif));
    localStorage.setItem('yt_planner_twitch_link', tempTwitchLink);
    
    setYtApiKey(tempApiKey);
    setYtChannelLink(tempChannelLink);
    setTwitchLink(tempTwitchLink);
    setLang(language);
    
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
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
        {/* VIEW SETTINGS */}
        <section className="settings-section">
          <h3><Layout size={18} /> {t.view}</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.startPage}</span>
              <span className="item-desc">{t.startPageDesc}</span>
            </div>
            <CustomSelect 
              label={t.startPage}
              value={startPage}
              options={[
                { label: t.hub, value: 'hub' },
                { label: t.planner, value: 'planner' }
              ]}
              onChange={(val) => setStartPage(val as any)}
            />
          </div>

          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.appearance}</span>
              <span className="item-desc">{t.themeDesc}</span>
            </div>
            <button className="btn btn-secondary theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </section>

        {/* YOUTUBE SETTINGS */}
        <section className="settings-section">
          <h3><Youtube size={18} /> {t.youtube}</h3>
          <div className="settings-item vertical">
            <div className="item-info">
              <span className="item-label">{t.youtubeLink}</span>
            </div>
            <div className="settings-input-wrapper">
              <Youtube size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="https://youtube.com/@handle" 
                value={tempChannelLink}
                onChange={(e) => setTempChannelLink(e.target.value)}
                className="settings-input"
              />
            </div>
          </div>
          <div className="settings-item vertical">
            <div className="item-info">
              <span className="item-label">{t.youtubeApiKey}</span>
            </div>
            <div className="settings-input-wrapper">
              <Key size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="settings-input"
              />
            </div>
          </div>
        </section>

        {/* TWITCH SETTINGS */}
        <section className="settings-section">
          <h3><Globe size={18} /> {t.twitch}</h3>
          <div className="settings-item vertical">
            <div className="item-info">
              <span className="item-label">{t.twitchLink}</span>
            </div>
            <div className="settings-input-wrapper">
              <Globe size={16} className="input-icon" style={{ color: '#9146ff' }} />
              <input 
                type="text" 
                placeholder="https://twitch.tv/username" 
                value={tempTwitchLink}
                onChange={(e) => setTempTwitchLink(e.target.value)}
                className="settings-input"
              />
            </div>
          </div>
        </section>

        {/* BRANDING SETTINGS */}
        <section className="settings-section">
          <h3><Layout size={18} /> {t.branding}</h3>
          <div className="settings-item">
            <div className="item-info">
              <span className="item-label">{t.uploadLogo}</span>
            </div>
            <div className="logo-upload-area">
              {customLogo && (
                <div className="logo-preview-container">
                  <img src={customLogo} alt="Preview" className="logo-preview" />
                  <button className="btn-remove-logo" onClick={handleRemoveLogo}>×</button>
                </div>
              )}
              <label className="logo-upload-btn">
                <span>{customLogo ? t.uploadLogo : t.uploadLogo}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
              </label>
            </div>
          </div>
        </section>

        {/* LANGUAGE SETTINGS */}
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

        {/* NOTIFICATION SETTINGS */}
        <section className="settings-section">
          <h3><Bell size={18} /> {t.notifications}</h3>
          <div className="settings-item">
            <div className="item-info">
              <Mail size={16} />
              <span className="item-label">{t.notifEmail}</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={emailNotif} 
                onChange={(e) => setEmailNotif(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="settings-item">
            <div className="item-info">
              <Smartphone size={16} />
              <span className="item-label">{t.notifBrowser}</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={browserNotif} 
                onChange={(e) => setBrowserNotif(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <button className="btn btn-secondary btn-full" onClick={() => alert('Test Benachrichtigung gesendet!')}>
            <Bell size={16} /> {t.notifTest}
          </button>
        </section>
      </div>

      <footer className="settings-footer">
        {showSavedMsg && <span className="save-message">{t.saved}</span>}
        <button className="btn btn-primary save-btn" onClick={handleSave}>
          <Save size={18} /> {t.save}
        </button>
      </footer>
    </div>
  );
};
