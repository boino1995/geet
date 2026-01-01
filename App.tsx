
import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, AppState, Playlist, Channel } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VideoPlayer from './components/VideoPlayer';
import { parseM3U } from './services/m3uParser';
import { analyzePlaylist } from './services/geminiService';

const STORAGE_KEY = 'lumina_iptv_data';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: ViewMode.DASHBOARD,
    playlists: [],
    activePlaylistId: null,
    selectedChannel: null,
    aiInsights: null,
    isLoading: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'vps'>('general');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ 
          ...prev, 
          playlists: parsed.playlists || [],
          activePlaylistId: parsed.activePlaylistId || null
        }));
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      playlists: state.playlists,
      activePlaylistId: state.activePlaylistId
    }));
  }, [state.playlists, state.activePlaylistId]);

  useEffect(() => {
    const activePlaylist = state.playlists.find(p => p.id === state.activePlaylistId);
    if (activePlaylist && activePlaylist.channels.length > 0) {
      const getInsights = async () => {
        const insights = await analyzePlaylist(activePlaylist.channels);
        setState(prev => ({ ...prev, aiInsights: insights }));
      };
      getInsights();
    }
  }, [state.activePlaylistId, state.playlists]);

  const handlePlaylistUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, isLoading: true }));
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const channels = parseM3U(content);
      
      const newPlaylist: Playlist = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.replace('.m3u', '').replace('.m3u8', ''),
        url: '',
        channels,
        updatedAt: Date.now()
      };

      setState(prev => ({
        ...prev,
        playlists: [newPlaylist, ...prev.playlists],
        activePlaylistId: newPlaylist.id,
        isLoading: false,
        view: ViewMode.CHANNELS
      }));
    };
    reader.readAsText(file);
  };

  const handleChannelSelect = (channel: Channel) => {
    setState(prev => ({ ...prev, selectedChannel: channel }));
  };

  const activePlaylist = state.playlists.find(p => p.id === state.activePlaylistId);
  const groups = Array.from(new Set(activePlaylist?.channels.map(c => c.group) || []));
  
  const filteredChannels = (activePlaylist?.channels || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar 
        currentView={state.view} 
        onViewChange={(view) => setState(prev => ({ ...prev, view }))} 
      />

      <main className="flex-1 overflow-y-auto">
        {state.view === ViewMode.DASHBOARD && (
          <Dashboard state={state} onViewChange={(view) => setState(prev => ({ ...prev, view }))} />
        )}

        {state.view === ViewMode.CHANNELS && (
          <div className="p-4 md:p-8 animate-in fade-in duration-300">
            <header className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">Channel Gallery</h1>
                  <p className="text-slate-500">{activePlaylist ? `${activePlaylist.name} - ${filteredChannels.length} results` : 'Upload a playlist to get started'}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-10 py-2.5 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <label className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2.5 rounded-xl cursor-pointer transition-colors group">
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <input type="file" accept=".m3u,.m3u8" className="hidden" onChange={handlePlaylistUpload} />
                  </label>
                </div>
              </div>

              {activePlaylist && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setSelectedGroup('All')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedGroup === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {groups.map(group => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        selectedGroup === group ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {!activePlaylist ? (
               <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center mb-6 text-slate-600">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">No Playlist Found</h2>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">Upload an M3U or M3U8 file to start streaming your favorite channels with Lumina AI.</p>
                  <label className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/20 cursor-pointer transition-all active:scale-95">
                     Choose File
                     <input type="file" accept=".m3u,.m3u8" className="hidden" onChange={handlePlaylistUpload} />
                  </label>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredChannels.map((channel, idx) => (
                  <button
                    key={`${channel.id}-${idx}`}
                    onClick={() => handleChannelSelect(channel)}
                    className="group relative bg-slate-900/40 border border-slate-800/50 rounded-3xl p-4 transition-all hover:bg-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 text-left flex flex-col items-center text-center"
                  >
                    <div className="relative w-full aspect-video rounded-2xl bg-slate-800/50 flex items-center justify-center overflow-hidden mb-4 ring-1 ring-white/5">
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                          onError={(e) => (e.currentTarget.src = `https://picsum.photos/300/200?seed=${channel.name}`)}
                        />
                      ) : (
                        <div className="text-4xl font-bold text-slate-700">{channel.name[0]}</div>
                      )}
                      <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-600/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                           <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                             <path d="M8 5v14l11-7z" />
                           </svg>
                         </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1 w-full px-2">{channel.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">{channel.group}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {state.view === ViewMode.SETTINGS && (
           <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Application Settings</h1>
                  <p className="text-slate-400">Manage your profile and hosting environment.</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setActiveSettingsTab('general')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSettingsTab === 'general' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    General
                  </button>
                  <button 
                    onClick={() => setActiveSettingsTab('vps')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSettingsTab === 'vps' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    VPS Setup
                  </button>
                </div>
              </header>

              {activeSettingsTab === 'general' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Account</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl">
                          <div>
                              <p className="font-semibold text-white">Current User</p>
                              <p className="text-sm text-slate-400">Guest Admin Access</p>
                          </div>
                          <button className="text-indigo-400 text-sm font-bold hover:underline">Change</button>
                        </div>
                    </div>
                  </section>

                  <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Playback</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                              <p className="font-semibold text-white">Autoplay next channel</p>
                              <p className="text-xs text-slate-500">Automatically start next stream</p>
                          </div>
                          <button className="w-12 h-6 bg-indigo-600 rounded-full relative shadow-inner">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                          </button>
                        </div>
                    </div>
                  </section>

                  <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4">Danger Zone</h3>
                    <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                       <div>
                          <p className="font-semibold text-white">Reset Local Storage</p>
                          <p className="text-sm text-slate-500">This will delete all saved playlists.</p>
                       </div>
                       <button 
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 text-white font-bold rounded-xl transition-all"
                       >
                          Clear Everything
                       </button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      Ubuntu VPS Quick Setup
                    </h3>
                    <p className="text-indigo-200/70 text-sm">Follow these steps to host Lumina IPTV on your own server.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                      <h4 className="font-bold text-white mb-3">1. Install Docker on Ubuntu</h4>
                      <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-indigo-300 overflow-x-auto">
                        sudo apt update && sudo apt install docker.io docker-compose -y
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                      <h4 className="font-bold text-white mb-3">2. Run with Docker Compose</h4>
                      <p className="text-slate-400 text-sm mb-3">Upload your files and run this command in the project directory:</p>
                      <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-indigo-300 overflow-x-auto">
                        docker-compose up -d --build
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                      <h4 className="font-bold text-white mb-3">3. Firewall Settings</h4>
                      <p className="text-slate-400 text-sm mb-3">Ensure port 8080 is open to the public:</p>
                      <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-indigo-300 overflow-x-auto">
                        sudo ufw allow 8080/tcp
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700 text-center">
                    <p className="text-slate-400 text-sm">Your application will be available at <span className="text-white font-mono">http://your-vps-ip:8080</span></p>
                  </div>
                </div>
              )}
           </div>
        )}
      </main>

      {state.selectedChannel && (
        <VideoPlayer 
          channel={state.selectedChannel} 
          onClose={() => setState(prev => ({ ...prev, selectedChannel: null }))} 
        />
      )}

      {state.isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg font-bold text-white animate-pulse">Processing Playlist Content...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
