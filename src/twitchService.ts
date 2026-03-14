export interface TwitchStreamInfo {
  isLive: boolean;
  gameName?: string;
  title?: string;
  viewerCount?: number;
  startedAt?: Date;
}

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const HELIX_URL = 'https://api.twitch.tv/helix';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAppAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to fetch Twitch token');

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Cache with 1 min buffer
    return cachedToken;
  } catch (error) {
    console.error('Twitch Token Error:', error);
    return null;
  }
}

export async function fetchTwitchStatus(clientId: string, clientSecret: string, channelUrl: string): Promise<TwitchStreamInfo | null> {
  if (!clientId || !clientSecret || !channelUrl) return null;

  const channelName = channelUrl.split('/').pop();
  if (!channelName) return null;

  const token = await getAppAccessToken(clientId, clientSecret);
  if (!token) return null;

  try {
    const response = await fetch(`${HELIX_URL}/streams?user_login=${channelName}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch Twitch stream status');

    const data = await response.json();
    const stream = data.data[0];

    if (stream) {
      return {
        isLive: true,
        gameName: stream.game_name,
        title: stream.title,
        viewerCount: stream.viewer_count,
        startedAt: new Date(stream.started_at)
      };
    }

    return { isLive: false };
  } catch (error) {
    console.error('Twitch API Error:', error);
    return null;
  }
}
