
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';

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
  const playerRef = useRef<HTMLDivElement>(null);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleVideoEnded = () => {
    // Move to next video when current one ends
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    setCurrentVideoIndex(nextIndex);
  };

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

  // Guard against empty videos array
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black rounded-lg">
        <p className="text-white">Sem vídeos para exibir. Adicione alguns vídeos para começar.</p>
      </div>
    );
  }

  return (
    <div 
      ref={playerRef} 
      onClick={handleTap}
      className={`relative rounded-lg overflow-hidden ${isFullScreen ? 'fullscreen' : ''}`}
    >
      <ReactPlayer
        url={videos[currentVideoIndex].url}
        playing={true}
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
