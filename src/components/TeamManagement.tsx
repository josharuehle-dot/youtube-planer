import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trash2, Search, Loader2, Shield, UserCheck, Edit3, Activity, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { translations, type Language } from '../translations';
import logo from '../assets/logo.png';
import './TeamManagement.css';

type Role = 'Admin' | 'Moderator' | 'Editor';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Aktiv' | 'Eingeladen';
}

interface TeamManagementProps {
  onBack: () => void;
  lang: Language;
  customLogo: string | null;
  panelName: string;
}

// Reuse CustomSelect concept locally for Team Management
const CustomSelect: React.FC<{
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  className?: string;
}> = ({ value, options, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    <div className={`custom-select-container ${className || ''}`} ref={containerRef} style={{ width: 'auto', minWidth: '120px' }}>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
        <span>{selectedOption?.label}</span>
        <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
      </div>
      {isOpen && (
        <div className="custom-select-options" style={{ top: 'calc(100% + 4px)', minWidth: '100%' }}>
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`custom-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            >
              {opt.label}
              {opt.value === value && <Check size={12} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TeamManagement: React.FC<TeamManagementProps> = ({ onBack,  lang,
  customLogo,
  panelName
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Editor' as Role, status: 'Eingeladen' as 'Aktiv' | 'Eingeladen' });
  const [activityLogs, setActivityLogs] = useState<{id: string, action: string, time: Date}[]>([]);

  const t = translations[lang].teamManagement;
  const tGlobal = translations[lang];

  const addLog = (action: string) => {
    setActivityLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), action, time: new Date() }, ...prev].slice(0, 5));
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching members:', error);
    } else if (data) {
      setMembers(data as Member[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel('team_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('team_members')
      .insert([
        { 
          name: newMember.name, 
          email: newMember.email, 
          role: newMember.role,
          status: newMember.status
        }
      ]);

    if (error) {
      alert('Fehler beim Einladen: ' + error.message);
    } else {
      addLog(`${newMember.name} eingeladen`);
      setNewMember({ name: '', email: '', role: 'Editor', status: 'Eingeladen' });
      setIsAdding(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Möchtest du dieses Mitglied wirklich entfernen?')) return;
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Fehler beim Löschen: ' + error.message);
    } else {
      const member = members.find(m => m.id === id);
      if (member) addLog(`${member.name} entfernt`);
    }
  };

  const handleUpdateRole = async (id: string, newRole: Role) => {
    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      alert('Fehler beim Aktualisieren der Rolle: ' + error.message);
    } else {
      const member = members.find(m => m.id === id);
      if (member) addLog(`Rolle von ${member.name} geändert`);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Aktiv' | 'Eingeladen') => {
    const { error } = await supabase
      .from('team_members')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Fehler beim Aktualisieren des Status: ' + error.message);
    } else {
      const member = members.find(m => m.id === id);
      if (member) addLog(`Status von ${member.name} auf ${newStatus} geändert`);
    }
  };

  const filteredMembers = members.filter((m: Member) => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="team-mgmt-container">
      <div className="team-mgmt-header">
        <div className="logo-group">
          <div className="logo-icon">
            <img 
              src={customLogo || logo} 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: customLogo ? '4px' : '0' }} 
            />
          </div>
          <span className="logo-text">{panelName}</span>
          <span className="badge-beta">BETA 5.3</span>
        </div>
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>{t.back}</span>
        </button>
      </div>

      <div className="team-mgmt-content">
        <div className="mgmt-hero">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {/* STATS CARDS */}
        <div className="mgmt-stats-grid">
          <div className="stat-mini-card glass">
            <Shield size={20} className="icon-admin" />
            <div className="stat-mini-info">
              <span className="stat-mini-value">{members.filter(m => m.role === 'Admin').length}</span>
              <span className="stat-mini-label">Admins</span>
            </div>
          </div>
          <div className="stat-mini-card glass">
            <UserCheck size={20} className="icon-mod" />
            <div className="stat-mini-info">
              <span className="stat-mini-value">{members.filter(m => m.role === 'Moderator').length}</span>
              <span className="stat-mini-label">Moderators</span>
            </div>
          </div>
          <div className="stat-mini-card glass">
            <Edit3 size={20} className="icon-editor" />
            <div className="stat-mini-info">
              <span className="stat-mini-value">{members.filter(m => m.role === 'Editor').length}</span>
              <span className="stat-mini-label">Editors</span>
            </div>
          </div>
          <div className="stat-mini-card glass">
            <Activity size={20} className="icon-active" />
            <div className="stat-mini-info">
              <span className="stat-mini-value">{members.filter(m => m.status === 'Aktiv').length}</span>
              <span className="stat-mini-label">{t.active}</span>
            </div>
          </div>
        </div>

        <div className="mgmt-actions glass">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
            <UserPlus size={18} />
            {isAdding ? t.cancel : t.addMember}
          </button>
        </div>

        {isAdding && (
          <form className="add-member-form glass" onSubmit={handleAddMember}>
            <div className="input-row">
              <div className="input-group">
                <label>{t.name}</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>{t.email}</label>
                <input 
                  type="email" 
                  value={newMember.email} 
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>{t.role}</label>
                <CustomSelect 
                  value={newMember.role}
                  options={[
                    { label: t.editor, value: 'Editor' },
                    { label: t.moderator, value: 'Moderator' },
                    { label: t.admin, value: 'Admin' }
                  ]}
                  onChange={(val) => setNewMember({...newMember, role: val as Role})}
                />
              </div>
              <div className="input-group">
                <label>{t.status}</label>
                <CustomSelect 
                  value={newMember.status}
                  options={[
                    { label: t.invited, value: 'Eingeladen' },
                    { label: t.active, value: 'Aktiv' }
                  ]}
                  onChange={(val) => setNewMember({...newMember, status: val as any})}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }}>
                {t.add}
              </button>
            </div>
          </form>
        )}

        <div className="members-list glass">
          <div className="list-header">
            <div className="col-user">{t.member}</div>
            <div className="col-role">{t.role}</div>
            <div className="col-status">{t.status}</div>
            <div className="col-actions"></div>
          </div>
          <div className="list-body">
            {filteredMembers.map((member: Member) => (
              <div key={member.id} className="member-row">
                <div className="col-user">
                  <div className="user-avatar">
                    {member.name.charAt(0)}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{member.name}</span>
                    <span className="user-email">{member.email}</span>
                  </div>
                </div>
                <div className="col-role">
                  <CustomSelect 
                    className={`role-select ${member.role.toLowerCase()}`}
                    value={member.role}
                    options={[
                      { label: t.admin, value: 'Admin' },
                      { label: t.moderator, value: 'Moderator' },
                      { label: t.editor, value: 'Editor' }
                    ]}
                    onChange={(val) => handleUpdateRole(member.id, val as Role)}
                  />
                </div>
                <div className="col-status">
                  <CustomSelect 
                    className={`status-select ${member.status.toLowerCase()}`}
                    value={member.status}
                    options={[
                      { label: t.active, value: 'Aktiv' },
                      { label: t.invited, value: 'Eingeladen' }
                    ]}
                    onChange={(val) => handleUpdateStatus(member.id, val as any)}
                  />
                </div>
                <div className="col-actions">
                  <button className="btn-icon-sm danger" title={t.remove} onClick={() => handleDeleteMember(member.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {loading && (
              <div className="loading-overlay">
                <Loader2 size={32} className="spinner" />
              </div>
            )}
            {!loading && filteredMembers.length === 0 && (
              <div className="empty-state">{t.empty}</div>
            )}
          </div>
        </div>

        <div className="mgmt-bottom-sections">
          <div className="mgmt-info-cards">
            <div className="info-card glass">
              <h3>{t.overview}</h3>
              <ul>
                <li><strong>{t.admin}:</strong> Voller Zugriff auf alle Funktionen.</li>
                <li><strong>{t.moderator}:</strong> Kann Videos planen und bearbeiten.</li>
                <li><strong>{t.editor}:</strong> Kann Skripte und Details bearbeiten.</li>
              </ul>
            </div>
            <div className="info-card glass invite-limits">
              <h3>{t.limits}</h3>
              <p>Dein Team kann bis zu 10 Mitglieder haben.</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(members.length / 10) * 100}%` }}></div>
              </div>
              <span>{members.length} {t.occupied}</span>
            </div>
          </div>

          {/* ACTIVITY LOG SECTION */}
            <div className="activity-log-section glass">
              <h3><Activity size={18} /> {t.activityLog}</h3>
              <div className="log-list">
                {activityLogs.length > 0 ? (
                  activityLogs.map(log => (
                    <div key={log.id} className="log-item">
                      <span className="log-action">{log.action}</span>
                      <span className="log-time">{log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))
                ) : (
                  <div className="log-empty">{lang === 'de' ? 'Keine neuen Aktivitäten.' : 'No recent activity.'}</div>
                )}
              </div>
            </div>
        </div>
      </div>

      <div className="team-panel-footer">
        <p>&copy; 2026 YouTube Planner Team. {tGlobal.teamPanel.footer}</p>
      </div>
    </div>
  );
};
