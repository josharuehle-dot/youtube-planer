
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
    // Note: forHandle search is more direct but sometimes snippet/search is needed
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error resolving handle:', error);
    return null;
  }
}

export async function fetchYouTubeStats(apiKey: string, channelLinkOrId: string): Promise<ChannelStats | null> {
  if (!apiKey || !channelLinkOrId) return null;

  try {
    let resolvedId = channelLinkOrId;
    const info = extractChannelInfo(channelLinkOrId);

    if (info?.type === 'handle') {
      const id = await getChannelIdFromHandle(info.value, apiKey);
      if (!id) return null;
      resolvedId = id;
    } else if (info?.type === 'id') {
      resolvedId = info.value;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${resolvedId}&key=${apiKey}`
    );
    const data = await response.json();

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
    return null;
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    return null;
  }
}
