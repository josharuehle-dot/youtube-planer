import React from 'react';
import { Layout, LogOut, ArrowRight, Settings, Users } from 'lucide-react';
import { translations, type Language } from '../translations';
import logo from '../assets/logo.png';
import './TeamPanel.css';

interface TeamPanelProps {
  onEnterPlanner: () => void;
  onEnterTeamManagement: () => void;
  onEnterSettings: () => void;
  onLogout: () => void;
  lang: Language;
  customLogo: string | null;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({ 
  onEnterPlanner, 
  onEnterTeamManagement, 
  onEnterSettings,
  onLogout,
  lang,
  customLogo
}) => {
  const t = translations[lang].teamPanel;

  return (
    <div className="team-panel-container">
      <div className="team-panel-header">
        <div className="logo-group">
          <div className="logo-icon">
            <img 
              src={customLogo || logo} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: customLogo ? '4px' : '0' }} 
            />
          </div>
          <span className="logo-text">Team Panel</span>
          <span className="badge-beta">BETA 4.6</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>
      </div>

      <div className="team-panel-content">
        <div className="welcome-section">
          <h1>{t.welcome}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="modules-grid">
          <div className="module-card glass" onClick={onEnterPlanner}>
            <div className="module-icon planner-icon">
              <Layout size={32} />
            </div>
            <div className="module-info">
              <h3>{t.plannerTitle}</h3>
              <p>{t.plannerDesc}</p>
            </div>
            <div className="module-action">
              <span>{t.open}</span>
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="module-card glass" onClick={onEnterSettings}>
            <div className="module-icon settings-icon">
              <Settings size={32} />
            </div>
            <div className="module-info">
              <h3>{t.settingsTitle}</h3>
              <p>{t.settingsDesc}</p>
            </div>
            <div className="module-action">
              <span>{t.open}</span>
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="module-card glass" onClick={onEnterTeamManagement}>
            <div className="module-icon members-icon">
              <Users size={32} />
            </div>
            <div className="module-info">
              <h3>{t.membersTitle}</h3>
              <p>{t.membersDesc}</p>
            </div>
            <div className="module-action">
              <span>{t.open}</span>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="team-panel-footer">
        <p>&copy; 2026 YouTube Planner Team. {t.footer}</p>
      </div>
    </div>
  );
};
