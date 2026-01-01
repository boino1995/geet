
export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  category?: string;
  tags?: string[];
}

export interface Playlist {
  id: string;
  name: string;
  url: string;
  channels: Channel[];
  updatedAt: number;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  CHANNELS = 'CHANNELS',
  PLAYER = 'PLAYER',
  SETTINGS = 'SETTINGS'
}

export interface AppState {
  view: ViewMode;
  playlists: Playlist[];
  activePlaylistId: string | null;
  selectedChannel: Channel | null;
  aiInsights: string | null;
  isLoading: boolean;
}
