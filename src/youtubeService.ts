
export interface ChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  hiddenSubscriberCount: boolean;
  channelName: string;
}

// Replace with real values once provided by the user
const API_KEY = 'AIzaSyBAhcpMxsKagDFgaD_VviSvKKc-7B5KpSs';
const CHANNEL_ID = 'UCJNCArP-lSKDmSDNA6aBqiw';

export async function fetchYouTubeStats(): Promise<ChannelStats | null> {
  // If no API key provided, return dummy data for now
  if (API_KEY === 'YOUR_API_KEY') {
    return {
      subscriberCount: "1250",
      viewCount: "45000",
      videoCount: "12",
      hiddenSubscriberCount: false,
      channelName: "UEFN Tipps & Tricks"
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${API_KEY}`
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
        channelName: snippet.title
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    return null;
  }
}
