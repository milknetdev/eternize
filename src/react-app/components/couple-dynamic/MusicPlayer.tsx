import { useState, useRef } from "react";
import { useWedding } from "@/react-app/contexts/WeddingContext";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer() {
  const { wedding, theme } = useWedding();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicUrl = wedding.music_url;

  // Don't render if no music URL
  if (!musicUrl) return null;

  // Check if it's a YouTube URL
  const isYouTube = musicUrl.includes("youtube.com") || musicUrl.includes("youtu.be");
  
  // Check if it's a Spotify URL
  const isSpotify = musicUrl.includes("spotify.com");

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  };

  // Extract Spotify embed URL
  const getSpotifyEmbed = (url: string) => {
    // Convert open.spotify.com/track/ID to embed URL
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
    return null;
  };

  const handlePlay = () => {
    setShowPrompt(false);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // For YouTube, we show a small embedded player
  if (isYouTube) {
    const videoId = getYouTubeId(musicUrl);
    if (!videoId) return null;

    return (
      <div className="fixed bottom-6 right-6 z-50">
        {showPrompt ? (
          <button
            onClick={() => setShowPrompt(false)}
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105"
            style={{ 
              backgroundColor: theme.primary,
              color: "white"
            }}
          >
            <Music className="w-5 h-5" />
            <span className="font-medium" style={{ fontFamily: theme.bodyFont }}>
              Ouvir música
            </span>
          </button>
        ) : (
          <div 
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: theme.background }}
          >
            <iframe
              width="280"
              height="80"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`}
              title="Wedding Music"
              allow="autoplay; encrypted-media"
              className="border-0"
            />
          </div>
        )}
      </div>
    );
  }

  // For Spotify, we show embedded player
  if (isSpotify) {
    const embedUrl = getSpotifyEmbed(musicUrl);
    if (!embedUrl) return null;

    return (
      <div className="fixed bottom-6 right-6 z-50">
        {showPrompt ? (
          <button
            onClick={() => setShowPrompt(false)}
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105"
            style={{ 
              backgroundColor: theme.primary,
              color: "white"
            }}
          >
            <Music className="w-5 h-5" />
            <span className="font-medium" style={{ fontFamily: theme.bodyFont }}>
              Ouvir música
            </span>
          </button>
        ) : (
          <div 
            className="rounded-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: theme.background }}
          >
            <iframe
              src={embedUrl}
              width="280"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="border-0"
            />
          </div>
        )}
      </div>
    );
  }

  // For direct audio URLs (MP3, etc.)
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />
      
      {showPrompt ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-all hover:scale-105 animate-pulse"
          style={{ 
            backgroundColor: theme.primary,
            color: "white"
          }}
        >
          <Music className="w-5 h-5" />
          <span className="font-medium" style={{ fontFamily: theme.bodyFont }}>
            Ouvir música
          </span>
        </button>
      ) : (
        <div 
          className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg"
          style={{ 
            backgroundColor: theme.background,
            border: `2px solid ${theme.primary}20`
          }}
        >
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ backgroundColor: theme.primary }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          
          <div className="flex flex-col">
            <span 
              className="text-xs font-medium"
              style={{ color: theme.text, fontFamily: theme.bodyFont }}
            >
              Nossa Música
            </span>
            <span 
              className="text-[10px]"
              style={{ color: `${theme.text}80` }}
            >
              {isPlaying ? "Tocando..." : "Pausado"}
            </span>
          </div>

          <button
            onClick={handleMute}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
            style={{ color: theme.text }}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
