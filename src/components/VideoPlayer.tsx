import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerProps {
  videos: {
    id: string;
    url: string;
    title: string;
  }[];
}

const VideoPlayer = ({ videos }: VideoPlayerProps) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (videos.length > 0) {
      setCurrentVideoIndex(0);
      setIsPlaying(true);
    }
  }, [videos]);

  const handleVideoEnded = useCallback(() => {
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    setIsPlaying(true);
  }, [currentVideoIndex, videos.length]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen().then(() => {
          setIsFullScreen(true);
          setShowControls(false);
        }).catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
          setShowControls(true);
          setTapCount(0);
        }).catch(err => {
          console.error(`Error attempting to exit full-screen mode: ${err.message}`);
        });
      }
    }
  }, []);

  const handleTap = useCallback(() => {
    if (!isFullScreen) return;

    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    
    tapTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);

    if (newCount >= 6) {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
        setShowControls(true);
        setTapCount(0);
      }).catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  }, [tapCount, isFullScreen]);

  React.useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        setShowControls(true);
        setTapCount(0);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black rounded-lg">
        <p className="text-white">Sem vídeos para exibir.</p>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <div 
      ref={playerRef} 
      onClick={handleTap}
      className={`relative rounded-lg overflow-hidden ${isFullScreen ? 'fullscreen' : ''}`}
    >
      <ReactPlayer
        url={currentVideo.url}
        playing={isPlaying}
        controls={false}
        loop={false}
        width="100%"
        height={isFullScreen ? "100vh" : "450px"}
        onEnded={handleVideoEnded}
        style={{ backgroundColor: 'black' }}
        config={{
          youtube: {
            playerVars: { 
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              autoplay: 1,
              loop: 1,
              playlist: currentVideo.url
            }
          },
          file: {
            attributes: {
              autoPlay: true,
              playsInline: true
            }
          }
        }}
      />
      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            onClick={() => setCurrentVideoIndex((currentVideoIndex - 1 + videos.length) % videos.length)}
            className="bg-black/70 hover:bg-black/90"
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-black/70 hover:bg-black/90"
            variant="outline"
            size="sm"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button 
            onClick={toggleFullScreen}
            className="bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Tela cheia
          </Button>
          <Button 
            onClick={() => setCurrentVideoIndex((currentVideoIndex + 1) % videos.length)}
            className="bg-black/70 hover:bg-black/90"
            variant="outline"
            size="sm"
          >
            Próximo
          </Button>
        </div>
      )}
      {isFullScreen && (
        <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          Toque 6x para sair ({tapCount}/6)
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
