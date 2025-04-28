
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
  const [videoError, setVideoError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const reactPlayerRef = useRef<ReactPlayer | null>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (videos.length > 0) {
      setCurrentVideoIndex(0);
      setIsPlaying(true);
      setVideoError(null);
    }
  }, [videos]);

  const handleVideoEnded = useCallback(() => {
    if (videos.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }
    setIsPlaying(true);
    setVideoError(null);
  }, [videos.length]);

  const handleVideoError = useCallback((error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => {
    console.error("Video error:", error, data);
    setVideoError(`Erro ao reproduzir vídeo: ${currentVideo?.title || 'Desconhecido'}`);
    
    toast({
      title: "Erro no vídeo",
      description: `Não foi possível reproduzir o vídeo: ${currentVideo?.title || 'Desconhecido'}`,
      variant: "destructive",
    });
    
    // Automatically try the next video after a short delay
    setTimeout(() => {
      if (videos.length > 1) {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setVideoError(null);
      }
    }, 3000);
  }, [currentVideo?.title, videos.length, toast]);

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
  const isYoutubeVideo = currentVideo.url.includes('youtu');

  return (
    <div 
      ref={playerRef} 
      onClick={handleTap}
      className={`relative rounded-lg overflow-hidden ${isFullScreen ? 'fullscreen' : ''}`}
    >
      {videoError && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center p-2 z-20">
          {videoError}
        </div>
      )}
      
      <ReactPlayer
        ref={reactPlayerRef}
        url={currentVideo.url}
        playing={isPlaying}
        controls={false}
        loop={videos.length === 1}
        width="100%"
        height={isFullScreen ? "100vh" : "450px"}
        onEnded={handleVideoEnded}
        onError={handleVideoError}
        style={{ backgroundColor: 'black' }}
        config={{
          youtube: {
            playerVars: { 
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              autoplay: 1,
              playlist: currentVideo.url,
              loop: 1,
              origin: window.location.origin,
              widget_referrer: window.location.origin,
              enablejsapi: 1
            }
          },
          file: {
            attributes: {
              autoPlay: true,
              playsInline: true,
              loop: videos.length === 1,
              crossOrigin: "anonymous",
              controlsList: "nodownload"
            },
            forceHLS: true,
            forceVideo: true
          }
        }}
      />
      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentVideoIndex((currentVideoIndex - 1 + videos.length) % videos.length);
              setVideoError(null);
            }}
            className="bg-black/70 hover:bg-black/90"
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="bg-black/70 hover:bg-black/90"
            variant="outline"
            size="sm"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              toggleFullScreen();
            }}
            className="bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Tela cheia
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentVideoIndex((currentVideoIndex + 1) % videos.length);
              setVideoError(null);
            }}
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
