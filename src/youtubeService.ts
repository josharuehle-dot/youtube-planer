
export interface ChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  hiddenSubscriberCount: boolean;
  channelName: string;
  avatarUrl?: string;
}

/**
 * Extracts channel handle or ID from various YouTube URL formats
 */
export function extractChannelInfo(url: string): { type: 'handle' | 'id' | 'custom', value: string } | null {
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // Handles: @name
  if (cleanUrl.startsWith('@')) {
    return { type: 'handle', value: cleanUrl };
  }

  // URLs: youtube.com/@handle
  const handleMatch = cleanUrl.match(/youtube\.com\/(@[\w.-]+)/);
  if (handleMatch) return { type: 'handle', value: handleMatch[1] };

  // URLs: youtube.com/channel/UC...
  const idMatch = cleanUrl.match(/youtube\.com\/channel\/([\w-]+)/);
  if (idMatch) return { type: 'id', value: idMatch[1] };

  // Support for /c/ and /user/ patterns
  const customMatch = cleanUrl.match(/youtube\.com\/(c|user)\/([\w.-]+)/);
  if (customMatch) return { type: 'handle', value: '@' + customMatch[2] };

  // Just an ID
  if (cleanUrl.startsWith('UC') && cleanUrl.length > 20) {
    return { type: 'id', value: cleanUrl };
  }

  return null;
}

/**
 * Fetches Channel ID for a given handle
 */
async function getChannelIdFromHandle(handle: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.error) {
      console.error('YouTube API Error (Resolve Handle):', data.error);
      return null;
    }
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    return null;
  } catch (error) {
    console.error('Network Error resolving handle:', error);
    return null;
  }
}

const FALLBACK_API_KEY = 'AIzaSyC67yS3rD95pwaxhbYqUd7XSfrLYgFC1kY';

export async function fetchYouTubeStats(apiKey: string | null, channelLinkOrId: string): Promise<ChannelStats | null> {
  const activeKey = apiKey || FALLBACK_API_KEY;
  if (!channelLinkOrId) return null;

  console.log('Fetching stats for:', channelLinkOrId, 'using key:', activeKey.substring(0, 8) + '...');

  try {
    let resolvedId = channelLinkOrId;
    const info = extractChannelInfo(channelLinkOrId);

    if (!info) {
      console.warn('Could not parse YouTube URL:', channelLinkOrId);
      return null;
    }

    if (info.type === 'handle') {
      const id = await getChannelIdFromHandle(info.value, activeKey);
      if (!id) {
        console.warn('Could not resolve handle to ID:', info.value);
        return null;
      }
      resolvedId = id;
    } else if (info.type === 'id') {
      resolvedId = info.value;
    }

    console.log('Resolved Channel ID:', resolvedId);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${resolvedId}&key=${activeKey}`
    );
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error (Stats):', data.error);
      return null;
    }

    if (data.items && data.items.length > 0) {
      const stats = data.items[0].statistics;
      const snippet = data.items[0].snippet;
      return {
        subscriberCount: stats.subscriberCount,
        viewCount: stats.viewCount,
        videoCount: stats.videoCount,
        hiddenSubscriberCount: stats.hiddenSubscriberCount,
        channelName: snippet.title,
        avatarUrl: snippet.thumbnails?.default?.url
      };
    }
    console.warn('No items found for resolved ID:', resolvedId);
    return null;
  } catch (error) {
    console.error('Network Error fetching YouTube stats:', error);
    return null;
  }
}
