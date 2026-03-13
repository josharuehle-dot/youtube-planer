import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Trash2, Shield, User, Search } from 'lucide-react';
import logo from '../assets/logo.png';
import './TeamManagement.css';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Moderator' | 'Editor';
  status: 'Aktiv' | 'Eingeladen';
}

interface TeamManagementProps {
  onBack: () => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onBack }) => {
  const [members] = useState<Member[]>([
    { id: '1', name: 'Josh Rühle', email: 'josh@example.com', role: 'Admin', status: 'Aktiv' },
    { id: '2', name: 'Team Member 1', email: 'member1@example.com', role: 'Editor', status: 'Aktiv' },
    { id: '3', name: 'Team Member 2', email: 'member2@example.com', role: 'Moderator', status: 'Eingeladen' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(m => 
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
          <button className="btn btn-primary">
            <UserPlus size={18} />
            Mitglied einladen
          </button>
        </div>

        <div className="members-list glass">
          <div className="list-header">
            <div className="col-user">Mitglied</div>
            <div className="col-role">Rolle</div>
            <div className="col-status">Status</div>
            <div className="col-actions"></div>
          </div>
          <div className="list-body">
            {filteredMembers.map(member => (
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
                  <span className={`role-badge ${member.role.toLowerCase()}`}>
                    <Shield size={12} />
                    {member.role}
                  </span>
                </div>
                <div className="col-status">
                  <span className={`status-dot ${member.status.toLowerCase()}`}></span>
                  {member.status}
                </div>
                <div className="col-actions">
                  <button className="btn-icon-sm" title="Bearbeiten">
                    <User size={14} />
                  </button>
                  <button className="btn-icon-sm danger" title="Entfernen">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && (
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
              <div className="progress" style={{ width: '30%' }}></div>
            </div>
            <span>3 von 10 Plätzen belegt</span>
          </div>
        </div>
      </div>

      <div className="team-panel-footer">
        <p>&copy; 2026 YouTube Planner Team. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  );
};
