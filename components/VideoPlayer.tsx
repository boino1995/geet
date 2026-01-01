
import React, { useEffect, useRef, useState } from 'react';
import { Channel } from '../types';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

declare global {
  interface Window {
    Hls: any;
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let hls: any;
    const video = videoRef.current;

    if (!video) return;

    if (window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setError("Autoplay prevented. Please click play."));
        setIsPlaying(true);
      });
      hls.on(window.Hls.Events.ERROR, (_: any, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error encountered.");
              hls.startLoad();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media decoding error.");
              hls.recoverMediaError();
              break;
            default:
              setError("An unrecoverable playback error occurred.");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setIsPlaying(true);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [channel.url]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-4 md:p-8 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {channel.logo && <img src={channel.logo} alt="" className="w-12 h-12 rounded bg-white/10 p-1 object-contain" />}
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight">{channel.name}</h2>
            <p className="text-slate-400 text-sm font-medium">{channel.group}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        <video 
          ref={videoRef} 
          controls 
          className="w-full h-full object-contain"
          poster={channel.logo || "https://picsum.photos/1280/720?blur=10"}
        />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-center p-6">
            <div>
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xl font-medium text-white mb-2">Playback Error</p>
              <p className="text-slate-400 max-w-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
              >
                Retry Stream
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Technical Info</h3>
          <p className="text-white text-sm font-mono break-all opacity-80">{channel.url}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
            <span className="text-white font-medium">{isPlaying ? 'Live Streaming' : 'Connecting...'}</span>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Resolution</h3>
          <p className="text-white font-medium">Adaptive Bitrate (HLS)</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
