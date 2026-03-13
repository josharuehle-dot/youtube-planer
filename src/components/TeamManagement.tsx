import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trash2, Search, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
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
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Editor' as Role });

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
          status: 'Eingeladen'
        }
      ]);

    if (error) {
      alert('Fehler beim Einladen: ' + error.message);
    } else {
      setNewMember({ name: '', email: '', role: 'Editor' });
      setIsAdding(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Möchtest du dieses Mitglied wirklich entfernen?')) return;
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) alert('Fehler beim Löschen: ' + error.message);
  };

  const handleUpdateRole = async (id: string, newRole: Role) => {
    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', id);

    if (error) alert('Fehler beim Aktualisieren: ' + error.message);
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
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="logo-text">Team Panel</span>
          <span className="badge-beta">BETA 2.6</span>
        </div>
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Zurück zum Hub</span>
        </button>
      </div>

      <div className="team-mgmt-content">
        <div className="mgmt-hero">
          <h1>Team Verwaltung</h1>
          <p>Verwalte deine Teammitglieder, rollen und Berechtigungen an einem Ort.</p>
        </div>

        <div className="mgmt-actions glass">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Mitglieder suchen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
            <UserPlus size={18} />
            {isAdding ? 'Abbrechen' : 'Mitglied einladen'}
          </button>
        </div>

        {isAdding && (
          <form className="add-member-form glass" onSubmit={handleAddMember}>
            <div className="input-row">
              <div className="input-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>E-Mail</label>
                <input 
                  type="email" 
                  value={newMember.email} 
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Rolle</label>
                <select 
                  value={newMember.role} 
                  onChange={e => setNewMember({...newMember, role: e.target.value as Role})}
                >
                  <option value="Editor">Editor</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }}>
                Hinzufügen
              </button>
            </div>
          </form>
        )}

        <div className="members-list glass">
          <div className="list-header">
            <div className="col-user">Mitglied</div>
            <div className="col-role">Rolle</div>
            <div className="col-status">Status</div>
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
                  <select 
                    className={`role-select ${member.role.toLowerCase()}`}
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value as Role)}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
                <div className="col-status">
                  <span className={`status-dot ${member.status.toLowerCase()}`}></span>
                  {member.status}
                </div>
                <div className="col-actions">
                  <button className="btn-icon-sm danger" title="Entfernen" onClick={() => handleDeleteMember(member.id)}>
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
              <div className="empty-state">Keine Mitglieder gefunden.</div>
            )}
          </div>
        </div>

        <div className="mgmt-info-cards">
          <div className="info-card glass">
            <h3>Berechtigungs-Übersicht</h3>
            <ul>
              <li><strong>Admin:</strong> Voller Zugriff auf alle Funktionen.</li>
              <li><strong>Moderator:</strong> Kann Videos planen und bearbeiten.</li>
              <li><strong>Editor:</strong> Kann Skripte und Details bearbeiten.</li>
            </ul>
          </div>
          <div className="info-card glass invite-limits">
            <h3>Einladungs-Limits</h3>
            <p>Dein Team kann bis zu 10 Mitglieder haben.</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${(members.length / 10) * 100}%` }}></div>
            </div>
            <span>{members.length} von 10 Plätzen belegt</span>
          </div>
        </div>
      </div>

      <div className="team-panel-footer">
        <p>&copy; 2026 YouTube Planner Team. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  );
};
