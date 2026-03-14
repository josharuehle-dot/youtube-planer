import { useState, useCallback, useEffect } from 'react';
import { Plus, Search, Sun, Moon, Menu, X as CloseIcon, Users, Eye, Video as VideoIcon, Layout } from 'lucide-react';
import type { Video, VideoStatus } from './types';
import { STATUS_COLORS } from './types';
import { Calendar } from './components/Calendar';
import { VideoList } from './components/VideoList';
import { VideoModal } from './components/VideoModal';
import { supabase } from './supabaseClient';
import { fetchYouTubeStats } from './youtubeService';
import type { ChannelStats } from './youtubeService';
import { Auth } from './components/Auth';
import { TeamPanel } from './components/TeamPanel';
import { TeamManagement } from './components/TeamManagement';
import { Settings } from './components/Settings';
import { translations, type Language } from './translations';
import logo from './assets/logo.png';
import './App.css';

// --- Sample demo data ---

type ModalState =
  | { mode: 'closed' }
  | { mode: 'new'; date: Date | null }
  | { mode: 'edit'; video: Video };

// Helper to format video data for/from DB
const formatVideoFromDB = (v: any): Video => ({
  ...v,
  uploadDate: v.upload_date ? new Date(v.upload_date) : null
});

const formatVideoToDB = (v: Video) => ({
  id: v.id,
  title: v.title,
  description: v.description,
  status: v.status,
  upload_date: v.uploadDate ? v.uploadDate.toISOString() : null
});

type StatusHoverState = VideoStatus | null;

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('team_unlocked') === 'true';
  });
  const [view, setView] = useState<'login' | 'hub' | 'planner' | 'team_management' | 'settings'>(() => {
    if (sessionStorage.getItem('team_unlocked') !== 'true') return 'login';
    const startPage = localStorage.getItem('yt_planner_start_page') as any;
    const savedView = sessionStorage.getItem('current_view') as any;
    return savedView || startPage || 'hub';
  });

  const [ytApiKey, setYtApiKey] = useState<string>(() => localStorage.getItem('yt_planner_api_key') || '');
  const [ytChannelLink, setYtChannelLink] = useState<string>(() => localStorage.getItem('yt_planner_channel_link') || 'https://www.youtube.com/@UEFN-TippsundTricks');
  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('yt_planner_custom_logo'));

  useEffect(() => {
    sessionStorage.setItem('current_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('yt_planner_api_key', ytApiKey);
    localStorage.setItem('yt_planner_channel_link', ytChannelLink);
  }, [ytApiKey, ytChannelLink]);

  useEffect(() => {
    if (customLogo) {
      localStorage.setItem('yt_planner_custom_logo', customLogo);
    } else {
      localStorage.removeItem('yt_planner_custom_logo');
    }
  }, [customLogo]);

  useEffect(() => {
    if (isUnlocked && view === 'login') {
      setView('hub');
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;
    async function fetchVideos() {
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching videos:', error);
      } else if (data) {
        setVideos(data.map(formatVideoFromDB));
      }
      setLoading(false);
    }
    fetchVideos();

    // Set up real-time subscription
    const channel = supabase
      .channel('videos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVideos(prev => [formatVideoFromDB(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setVideos(prev => prev.map(v => v.id === payload.new.id ? formatVideoFromDB(payload.new) : v));
        } else if (payload.eventType === 'DELETE') {
          setVideos(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;
    async function getStats() {
      if (!ytChannelLink) {
        setStats(null);
        return;
      }
      const data = await fetchYouTubeStats(ytApiKey || null, ytChannelLink);
      setStats(data);
    }
    getStats();
  }, [isUnlocked, ytChannelLink, ytApiKey]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalState, setModalState] = useState<ModalState>({ mode: 'closed' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<StatusHoverState>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('yt_planner_theme') as 'dark' | 'light') || 'dark';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('yt_planner_lang') as Language) || 'de';
  });

  const t = translations[lang];

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yt_planner_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Filter by search
  const displayedVideos = searchQuery
    ? videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : videos;

  const openNewModal = (date: Date | null = null) =>
    setModalState({ mode: 'new', date });

  const openEditModal = (video: Video) =>
    setModalState({ mode: 'edit', video });

  const closeModal = () => setModalState({ mode: 'closed' });

  const handleSave = useCallback(async (saved: Video) => {
    const dbData = formatVideoToDB(saved);
    const { error } = await supabase.from('videos').upsert(dbData);
    if (error) {
      console.error('Core Save Error:', error.message, error.details, error.hint);
      alert(`Fehler beim Speichern: ${error.message}\n\nHinweis: Prüfe ob die Tabelle existiert.`);
    }
    closeModal();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete!');
    }
  }, []);

  // Status counts for the header bar
  const statusSummary: Partial<Record<VideoStatus, number>> = {};
  videos.forEach(v => {
    if (v.status !== 'Published') statusSummary[v.status] = (statusSummary[v.status] ?? 0) + 1;
  });

  if (view === 'login') {
    return <Auth onUnlock={() => {
      setIsUnlocked(true);
      setView('hub');
    }} lang={lang} customLogo={customLogo} />;
  }

  if (view === 'hub') {
    return (
      <TeamPanel 
        onEnterPlanner={() => setView('planner')} 
        onEnterTeamManagement={() => setView('team_management')}
        onEnterSettings={() => setView('settings')}
        onLogout={() => {
          sessionStorage.removeItem('team_unlocked');
          sessionStorage.removeItem('current_view');
          setIsUnlocked(false);
          setView('login');
        }}
        lang={lang}
        customLogo={customLogo}
      />
    );
  }

  if (view === 'team_management') {
    return (
      <TeamManagement onBack={() => setView('hub')} />
    );
  }

  if (view === 'settings') {
    return (
      <Settings 
        onBack={() => setView('hub')} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        lang={lang}
        setLang={setLang}
        ytApiKey={ytApiKey}
        setYtApiKey={setYtApiKey}
        ytChannelLink={ytChannelLink}
        setYtChannelLink={setYtChannelLink}
        customLogo={customLogo}
        setCustomLogo={setCustomLogo}
      />
    );
  }

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <img 
              src={customLogo || logo} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: customLogo ? '4px' : '0' }} 
            />
          </div>
          <span className="logo-text">YT Planner</span>
          <span className="badge-beta">BETA 3.4</span>
          <button className="mobile-close btn-icon" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="sidebar-hub-action" style={{ padding: '0 24px 16px', marginTop: '12px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', gap: '12px' }}
            onClick={() => setView('hub')}
          >
            <Layout size={16} /> {t.sidebar.teamHub}
          </button>
        </div>

        <div className="sidebar-content">
          {/* Stats Section */}
          <div className="sidebar-section">
            <h3 className="section-title">{t.sidebar.insights}</h3>
            <div className="stats-grid">
              <a 
                href={ytChannelLink || "https://www.youtube.com"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="stat-card link-card"
              >
                {stats?.avatarUrl ? (
                  <img src={stats.avatarUrl} alt="Avatar" className="stat-icon channel-avatar" style={{ borderRadius: '50%' }} />
                ) : (
                  <Layout size={14} className="stat-icon" />
                )}
                <div className="stat-info">
                  <span className="stat-value" style={{ fontSize: '0.9rem' }}>{stats?.channelName || "Channel"}</span>
                  <span className="stat-label">YouTube</span>
                </div>
              </a>
              <div className="stat-card">
                <Users size={14} className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats ? Number(stats.subscriberCount).toLocaleString() : '---'}</span>
                  <span className="stat-label">{t.sidebar.subs}</span>
                </div>
              </div>
              <div className="stat-card">
                <Eye size={14} className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats ? Number(stats.viewCount).toLocaleString() : '---'}</span>
                  <span className="stat-label">{t.sidebar.views}</span>
                </div>
              </div>
              <div className="stat-card">
                <VideoIcon size={14} className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats ? stats.videoCount : '---'}</span>
                  <span className="stat-label">{t.sidebar.videos}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '24px' }}
            onClick={() => openNewModal()}
            id="add-video-btn"
          >
            <Plus size={18} /> {t.sidebar.newVideo}
          </button>

          {/* Status summary */}
          <div className="sidebar-section">
            <h3 className="section-title">{t.sidebar.pipeline}</h3>
            <div className="pipeline-summary">
              {(Object.entries(statusSummary) as [VideoStatus, number][]).map(([status, count]) => (
                <div 
                  key={status} 
                  className="pipeline-row"
                  onMouseEnter={() => setHoveredStatus(status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <span
                    className="pipeline-dot"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  <span className="pipeline-label">{status}</span>
                  <span className="pipeline-count">{count}</span>
                  
                  {hoveredStatus === status && (
                    <div className="pipeline-popup glass-panel">
                      <h4 className="popup-title">{status} Videos</h4>
                      <ul className="popup-list">
                        {videos
                          .filter(v => v.status === status)
                          .map(v => (
                            <li key={v.id} className="popup-item" onClick={() => openEditModal(v)}>
                              {v.title}
                            </li>
                          ))}
                        {videos.filter(v => v.status === status).length === 0 && (
                          <li className="popup-empty">No videos yet</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {Object.keys(statusSummary).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active videos</p>
              )}
            </div>
          </div>

          {/* Unscheduled videos */}
          <div className="sidebar-section">
            <h3 className="section-title">{t.sidebar.unscheduled}</h3>
            <VideoList
              videos={displayedVideos}
              onEditVideo={openEditModal}
              lang={lang}
            />
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 'auto' }}
            onClick={() => {
              sessionStorage.removeItem('team_unlocked');
              sessionStorage.removeItem('current_view');
              setIsUnlocked(false);
              setView('login');
            }}
          >
            {t.sidebar.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn btn-icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <h2 className="topbar-title">{t.sidebar.contentCalendar}</h2>
            <span className="topbar-date">{currentDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="topbar-actions">
            <button className="btn-icon" title="Toggle Theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {showSearch && (
              <input
                autoFocus
                className="search-input"
                placeholder={t.sidebar.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              />
            )}
            <button className="btn-icon" title="Search" onClick={() => setShowSearch(s => !s)}>
              <Search size={18} />
            </button>
            <button className="btn btn-primary" onClick={() => openNewModal()} id="add-video-topbar-btn">
              <Plus size={16} /> {t.sidebar.schedule}
            </button>
          </div>
        </header>
        
        {loading ? (
          <div className="loading-state">Lade Cloud-Daten...</div>
        ) : (
          <div className="content-area">
            <Calendar
              videos={displayedVideos}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onVideoClick={openEditModal}
              onDayClick={(date) => openNewModal(date)}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Modal */}
      {modalState.mode !== 'closed' && (
        <VideoModal
          video={modalState.mode === 'edit' ? modalState.video : null}
          prefillDate={modalState.mode === 'new' ? modalState.date : null}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
          lang={lang}
        />
      )}
    </div>
  );
}
