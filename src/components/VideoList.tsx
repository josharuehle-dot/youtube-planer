import React from 'react';
import type { Video } from '../types';
import { STATUS_COLORS } from '../types';
import { GripVertical } from 'lucide-react';
import './VideoList.css';

interface VideoListProps {
  videos: Video[];
  onEditVideo: (video: Video) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ videos, onEditVideo }) => {
  const unscheduledVideos = videos.filter(v => !v.uploadDate);

  if (unscheduledVideos.length === 0) {
    return (
      <div className="empty-state">
        <p>No unscheduled ideas.</p>
      </div>
    );
  }

  return (
    <div className="video-list">
      {unscheduledVideos.map((video) => (
        <div key={video.id} className="video-card glass-panel" onClick={() => onEditVideo(video)}>
          <div className="video-card-drag">
            <GripVertical size={14} />
          </div>
          <div className="video-card-content">
            <h4 className="video-card-title">{video.title}</h4>
            <div className="video-card-meta">
              <span 
                className="status-badge" 
                style={{ backgroundColor: `${STATUS_COLORS[video.status]}20`, color: STATUS_COLORS[video.status], border: `1px solid ${STATUS_COLORS[video.status]}40` }}
              >
                {video.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
