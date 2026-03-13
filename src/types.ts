export type VideoStatus = 'Idea' | 'Scripting' | 'Recording' | 'Editing' | 'Ready' | 'Published';

export interface Video {
  id: string;
  title: string;
  description: string;
  status: VideoStatus;
  uploadDate: Date | null; // null if not yet scheduled
}

export const STATUS_COLORS: Record<VideoStatus, string> = {
  Idea: 'var(--info)',
  Scripting: 'var(--warning)',
  Recording: 'var(--danger)',
  Editing: 'var(--accent-secondary)',
  Ready: 'var(--success)',
  Published: 'var(--text-muted)'
};
