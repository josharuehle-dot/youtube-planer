import React from 'react';
import { Layout, LogOut, ArrowRight, Settings, Users, Video, Globe } from 'lucide-react';
import { translations, type Language } from '../translations';
import logo from '../assets/logo.png';
import type { ChannelStats } from '../youtubeService';
import type { TwitchStreamInfo } from '../twitchService';
import './TeamPanel.css';

interface TeamPanelProps {
  onEnterPlanner: () => void;
  onEnterTeamManagement: () => void;
  onEnterSettings: () => void;
  onLogout: () => void;
  lang: Language;
  customLogo: string | null;
  stats: ChannelStats | null;
  twitchStatus: TwitchStreamInfo | null;
  panelName: string;
  welcomeMessage: string;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({ 
  onEnterPlanner, 
  onEnterTeamManagement, 
  onEnterSettings,
  onLogout,
  lang,
  customLogo,
  stats,
  twitchStatus,
  panelName,
  welcomeMessage
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
          <span className="logo-text">{panelName}</span>
          <span className="badge-beta">BETA 5.0</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>
      </div>

      <div className="team-panel-content">
        <div className="welcome-section">
          <h1>{welcomeMessage || t.welcome}</h1>
          <p>{t.subtitle}</p>
        </div>

        {/* Stats Section in Hub */}
        <div className="hub-stats-row">
          <div className="hub-stat-group yt-group">
            <div className="hub-stat-card glass">
              <div className="hub-stat-header">
                {stats?.avatarUrl ? (
                  <img src={stats.avatarUrl} alt="YT Avatar" className="hub-channel-avatar" />
                ) : (
                  <div className="hub-stat-icon yt-icon"><Video size={20} /></div>
                )}
                <div className="hub-stat-title">
                  <span className="hub-val">{stats?.channelName || "---"}</span>
                  <span className="hub-lab">YouTube</span>
                </div>
              </div>
              <div className="hub-stat-metrics">
                <div className="hub-metric">
                  <span className="met-val">{stats ? Number(stats.subscriberCount).toLocaleString() : '---'}</span>
                  <span className="met-lab">Subs</span>
                </div>
                <div className="hub-metric">
                  <span className="met-val">{stats ? Number(stats.viewCount).toLocaleString() : '---'}</span>
                  <span className="met-lab">Views</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hub-stat-group twitch-group">
            <div className="hub-stat-card glass twitch-border">
              <div className="hub-stat-header">
                <div className="hub-stat-icon twitch-icon"><Globe size={20} /></div>
                <div className="hub-stat-title">
                  <span className="hub-val">Twitch</span>
                  <span className="hub-lab">Live Status</span>
                </div>
              </div>
              <div className="hub-stat-metrics">
                <div className="hub-metric">
                  <span 
                    className={`met-val ${twitchStatus?.isLive ? 'live-text' : ''}`}
                    style={{ color: twitchStatus?.isLive ? '#eb0400' : 'var(--text-muted)' }}
                  >
                    {twitchStatus?.isLive ? 'LIVE' : 'OFFLINE'}
                  </span>
                  <span className="met-lab">Status</span>
                </div>
                {twitchStatus?.isLive && (
                  <div className="hub-metric">
                    <span className="met-val">{twitchStatus.viewerCount}</span>
                    <span className="met-lab">Viewers</span>
                  </div>
                )}
              </div>
            </div>
          </div>
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
