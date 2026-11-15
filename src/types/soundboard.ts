export interface AudioDeviceOption {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  isVirtual?: boolean;
}

export interface SoundboardItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  url: string;
  color: string;
  hotkey?: string;
  duration?: string;
  isCustom?: boolean;
}

export interface YoutubeTrackItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  thumbnail: string;
  streamUrl?: string;
}

export interface Track {
  video_id: string;
  title: string;
  artist: string;
  duration?: string;
  thumbnail?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  track_count?: number;
  tracks: Track[];
  author?: string;
  isDefault?: boolean;
  is_private?: boolean;
  created_at?: string;
}

export interface LikedMusicTrack {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  thumbnail?: string;
  url: string;
  category_id?: string;
  is_verified_music: boolean;
  needs_verification: boolean;
  channel_title?: string;
}

export interface YouTubeAuthStatus {
  is_authenticated: boolean;
  has_api_access: boolean;
  channel_title?: string;
  avatar_url?: string;
  message: string;
}

export interface YouTubeUserProfile {
  channel_id: string;
  title: string;
  description?: string | null;
  custom_url?: string | null;
  avatar_url?: string | null;
  subscriber_count?: string | null;
  video_count?: string | null;
  connected_at: string;
}

export interface YouTubeAuthConfig {
  client_id: string;
  client_secret?: string | null;
}

export type BikeLifeGenre =
  | 'Drill'
  | 'Phonk'
  | 'Brazilian Funk'
  | 'Trap'
  | 'Bass Music'
  | 'Remix'
  | 'Perso';

export interface BikeLifeTrack {
  id: string;
  title: string;
  artist: string;
  genre: BikeLifeGenre;
  url: string;
  duration?: string;
  volume: number; // 0 to 100
  bpm?: number;
  isCustom?: boolean;
  coverColor?: string;
}

