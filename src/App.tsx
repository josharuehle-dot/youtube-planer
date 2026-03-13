import { useState, useCallback, useEffect } from 'react';
import { PlaySquare, Plus, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Video, VideoStatus } from './types';
import { STATUS_COLORS } from './types';
import { Calendar } from './components/Calendar';
import { VideoList } from './components/VideoList';
import { VideoModal } from './components/VideoModal';
import { supabase } from './supabaseClient';
import './App.css';

// --- Sample demo data ---
const today = new Date();
const d = (delta: number) => { const dt = new Date(today); dt.setDate(dt.getDate() + delta); return dt; };

const INITIAL_VIDEOS: Video[] = [];

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

const STORAGE_KEY = 'yt_planner_videos'; // Keeping for reference or removing if safe

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
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
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalState, setModalState] = useState<ModalState>({ mode: 'closed' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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
      console.error('Error saving video:', error);
      alert('Failed to save!');
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

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <PlaySquare size={18} strokeWidth={2.5} />
          </div>
          <span className="logo-text">YT Planner</span>
        </div>

        <div className="sidebar-content">
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '24px' }}
            onClick={() => openNewModal()}
            id="add-video-btn"
          >
            <Plus size={18} /> New Video
          </button>

          {/* Status summary */}
          <div className="sidebar-section">
            <h3 className="section-title">Pipeline</h3>
            <div className="pipeline-summary">
              {(Object.entries(statusSummary) as [VideoStatus, number][]).map(([status, count]) => (
                <div key={status} className="pipeline-row">
                  <span
                    className="pipeline-dot"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  <span className="pipeline-label">{status}</span>
                  <span className="pipeline-count">{count}</span>
                </div>
              ))}
              {Object.keys(statusSummary).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active videos</p>
              )}
            </div>
          </div>

          {/* Unscheduled videos */}
          <div className="sidebar-section">
            <h3 className="section-title">Unscheduled</h3>
            <VideoList
              videos={displayedVideos}
              onEditVideo={openEditModal}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">Content Calendar</h2>
            <span className="topbar-date">{currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="topbar-actions">
            {showSearch && (
              <input
                autoFocus
                className="search-input"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              />
            )}
            <button className="btn-icon" title="Search" onClick={() => setShowSearch(s => !s)}>
              <Search size={18} />
            </button>
            <button className="btn btn-primary" onClick={() => openNewModal()} id="add-video-topbar-btn">
              <Plus size={16} /> Schedule
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
        />
      )}
    </div>
  );
}
