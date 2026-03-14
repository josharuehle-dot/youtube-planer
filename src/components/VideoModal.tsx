import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, FileText, Tag } from 'lucide-react';
import { translations, type Language } from '../translations';
import type { Video, VideoStatus } from '../types';
import { STATUS_COLORS } from '../types';
import { v4 as uuidv4 } from 'uuid';
import './VideoModal.css';

interface VideoModalProps {
  video: Video | null; // null = create new
  prefillDate?: Date | null;
  onSave: (video: Video) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  lang: Language;
}

const STATUS_OPTIONS: VideoStatus[] = ['Idea', 'Scripting', 'Recording', 'Editing', 'Ready', 'Published'];

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  prefillDate,
  onSave,
  onDelete,
  onClose,
  lang,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<VideoStatus>('Idea');
  const [uploadDate, setUploadDate] = useState('');

  const t = translations[lang].modal;
  const ts = translations[lang].status;

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description);
      setStatus(video.status);
      setUploadDate(
        video.uploadDate ? formatDateForInput(new Date(video.uploadDate)) : ''
      );
    } else if (prefillDate) {
      setUploadDate(formatDateForInput(prefillDate));
    }
  }, [video, prefillDate]);

  function formatDateForInput(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const saved: Video = {
      id: video?.id ?? uuidv4(),
      title: title.trim(),
      description: description.trim(),
      status,
      uploadDate: uploadDate ? new Date(uploadDate + 'T12:00:00') : null,
    };
    onSave(saved);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const isEditing = !!video;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-panel glass-panel">
        <header className="modal-header">
          <h3>{isEditing ? t.editTitle : t.newTitle}</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="video-title">
              <FileText size={14} /> {t.titleLabel}
            </label>
            <input
              id="video-title"
              type="text"
              placeholder={t.titlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="video-desc">
              <FileText size={14} /> {t.descLabel}
            </label>
            <textarea
              id="video-desc"
              placeholder={t.descPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="form-input form-textarea"
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label>
              <Tag size={14} /> {t.statusLabel}
            </label>
            <div className="status-options">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-option ${status === s ? 'active' : ''}`}
                  style={{
                    color: STATUS_COLORS[s],
                    borderColor: status === s ? STATUS_COLORS[s] : 'var(--surface-border)',
                    background: status === s ? `${STATUS_COLORS[s]}15` : 'var(--surface-color)',
                  }}
                  onClick={() => setStatus(s)}
                >
                  {ts[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Date */}
          <div className="form-group">
            <label htmlFor="upload-date">
              <Calendar size={14} /> {t.dateLabel}
            </label>
            <input
              id="upload-date"
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="form-input"
            />
            {uploadDate && (
              <button
                type="button"
                className="clear-date"
                onClick={() => setUploadDate('')}
              >
                {t.removeDate}
              </button>
            )}
          </div>

          <div className="modal-actions">
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => { onDelete(video.id); onClose(); }}
              >
                <Trash2 size={16} /> {t.delete}
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              {isEditing ? t.saveChanges : t.addVideo}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
