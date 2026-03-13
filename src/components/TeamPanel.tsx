import React from 'react';
import { Layout, LogOut, ArrowRight, PlaySquare, Settings, Users } from 'lucide-react';
import './TeamPanel.css';

interface TeamPanelProps {
  onEnterPlanner: () => void;
  onLogout: () => void;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({ onEnterPlanner, onLogout }) => {
  return (
    <div className="team-panel-container">
      <div className="team-panel-header">
        <div className="logo-group">
          <div className="logo-icon">
            <PlaySquare size={24} />
          </div>
          <span className="logo-text">Team Panel</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Abmelden</span>
        </button>
      </div>

      <div className="team-panel-content">
        <div className="welcome-section">
          <h1>Willkommen zurück, Team! 👋</h1>
          <p>Wähle ein Modul aus, um zu beginnen.</p>
        </div>

        <div className="modules-grid">
          <div className="module-card glass" onClick={onEnterPlanner}>
            <div className="module-icon planner-icon">
              <Layout size={32} />
            </div>
            <div className="module-info">
              <h3>YouTube Planer</h3>
              <p>Verwalte deine Video-Uploads, Skripte und Deadlines in einer übersichtlichen Kalenderansicht.</p>
            </div>
            <div className="module-action">
              <span>Öffnen</span>
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="module-card glass disabled">
            <div className="module-icon settings-icon">
              <Settings size={32} />
            </div>
            <div className="module-info">
              <h3>Einstellungen</h3>
              <p>Passe Teameinstellungen, Passwörter und Webhook-Benachrichtigungen an.</p>
              <span className="coming-soon">Demnächst</span>
            </div>
          </div>

          <div className="module-card glass disabled">
            <div className="module-icon members-icon">
              <Users size={32} />
            </div>
            <div className="module-info">
              <h3>Team Verwaltung</h3>
              <p>Verwalte Teammitglieder und deren Berechtigungen.</p>
              <span className="coming-soon">Demnächst</span>
            </div>
          </div>
        </div>
      </div>

      <div className="team-panel-footer">
        <p>&copy; 2024 YouTube Planner Team. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  );
};
