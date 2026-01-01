
import React from 'react';
import { AppState, ViewMode } from '../types';

interface DashboardProps {
  state: AppState;
  onViewChange: (view: ViewMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onViewChange }) => {
  const activePlaylist = state.playlists.find(p => p.id === state.activePlaylistId);
  const totalChannels = activePlaylist?.channels.length || 0;
  const categories = Array.from(new Set(activePlaylist?.channels.map(c => c.group) || [])).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Streaming Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back to your Lumina IPTV command center.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => onViewChange(ViewMode.CHANNELS)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
                Start Watching
            </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Channels</p>
          <p className="text-3xl font-bold text-white mt-1">{totalChannels}</p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">Categories</p>
          <p className="text-3xl font-bold text-white mt-1">{categories}</p>
        </div>
        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">Active Streams</p>
          <p className="text-3xl font-bold text-white mt-1">Ready</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gemini AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800/40 p-8 rounded-[2.5rem] border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <svg className="w-48 h-48 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L14.4 9.6H22L15.8 14.2L18.2 21.8L12 17.2L5.8 21.8L8.2 14.2L2 9.6H9.6L12 2Z" />
               </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Gemini Smart Scan</span>
                <div className="flex-1 h-[1px] bg-indigo-500/20"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Content Insights</h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                {state.aiInsights ? (
                   <div dangerouslySetInnerHTML={{ __html: state.aiInsights.replace(/\n/g, '<br/>') }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-4 opacity-50">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                    <p>Generating intelligent content analysis...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/20 p-8 rounded-3xl border border-slate-700/30">
             <h3 className="text-lg font-bold text-white mb-4">Recent Playlists</h3>
             {state.playlists.length > 0 ? (
                <div className="space-y-4">
                  {state.playlists.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                           </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.channels.length} Channels • Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-slate-500 text-center py-4">No playlists added yet.</p>
             )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
               <button className="w-full text-left p-3 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-300 text-sm flex items-center gap-3">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Top Rated Sports
               </button>
               <button className="w-full text-left p-3 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-300 text-sm flex items-center gap-3">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  New Movie Releases
               </button>
               <button className="w-full text-left p-3 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-300 text-sm flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Kid-Safe Zones
               </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-600/20">
            <h3 className="font-bold text-white mb-2">Upgrade to Pro</h3>
            <p className="text-indigo-100 text-sm mb-4">Get unlimited playlist analysis and custom AI categories.</p>
            <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-sm">
               Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
