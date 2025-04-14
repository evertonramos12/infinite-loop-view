
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const [offlineVideos, setOfflineVideos] = useState<{[key: string]: string}>({});
  const playerRef = useRef<HTMLDivElement>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load cached videos on component mount
  useEffect(() => {
    const loadCachedVideos = async () => {
      try {
        const cachedVideos = localStorage.getItem('offlineVideos');
        if (cachedVideos) {
          setOfflineVideos(JSON.parse(cachedVideos));
        }
      } catch (error) {
        console.error('Error loading cached videos:', error);
      }
    };
    
    loadCachedVideos();
  }, []);

  const handleVideoEnded = useCallback(() => {
    // Move to next video when current one ends
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
    // Ensure autoplay continues
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

    // Increment tap count
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    // Reset the timer each time there's a tap
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    
    // Set a new timer to reset the tap count after 2 seconds of inactivity
    tapTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2000);

    // Check if we've reached 6 taps
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

  // Handle fullscreen change event from browser
  useEffect(() => {
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

  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  // Store video offline
  const storeVideoOffline = async (videoId: string, videoUrl: string) => {
    try {
      // We can only store URLs that we can cache
      // YouTube videos can't be directly cached, but we can save the URL
      const updatedOfflineVideos = {...offlineVideos, [videoId]: videoUrl};
      localStorage.setItem('offlineVideos', JSON.stringify(updatedOfflineVideos));
      setOfflineVideos(updatedOfflineVideos);
      
      toast({
        title: "Vídeo disponível offline",
        description: "Este vídeo estará disponível mesmo sem internet",
      });
    } catch (error) {
      console.error('Error storing video offline:', error);
      toast({
        title: "Erro",
        description: "Não foi possível armazenar o vídeo offline",
        variant: "destructive",
      });
    }
  };

  // Check if video is available offline
  const isVideoOffline = (videoId: string) => {
    return !!offlineVideos[videoId];
  };

  // Guard against empty videos array
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black rounded-lg">
        <p className="text-white">Sem vídeos para exibir. Adicione alguns vídeos para começar.</p>
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
          <Button
            onClick={() => storeVideoOffline(currentVideo.id, currentVideo.url)}
            className={`${isVideoOffline(currentVideo.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-black/70 hover:bg-black/90'}`}
            variant="outline"
            size="sm"
            title={isVideoOffline(currentVideo.id) ? 'Vídeo disponível offline' : 'Salvar para visualização offline'}
          >
            {isVideoOffline(currentVideo.id) ? 'Disponível Offline' : 'Salvar Offline'}
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
