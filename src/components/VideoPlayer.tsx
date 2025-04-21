
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Novo tipo que engloba vídeos e imagens:
type SequenceItem = {
  id: string;
  url: string;
  title: string;
  type: 'video' | 'image';
};

// VideoPlayerProps ajustado para aceitar ambos:
interface VideoPlayerProps {
  // Aceita array de vídeos ou imagens, deve vir assim da página.
  sequence: SequenceItem[];
}

const IMAGE_DISPLAY_SECONDS = 7;

const VideoPlayer = ({ sequence }: VideoPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<number | null>(null);
  const tapTimerRef = useRef<number | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset image error state when changing items
  useEffect(() => {
    setImgError(false);
  }, [currentIndex]);

  // A cada troca de item, se for image, aciona timer automático para próximo
  useEffect(() => {
    const currentItem = sequence[currentIndex];
    if (!currentItem) return;

    // Se for imagem, agenda a troca
    if (currentItem.type === 'image') {
      timerRef.current && clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        handleNext();
      }, IMAGE_DISPLAY_SECONDS * 1000);
    } else {
      // Se for vídeo, não mexe (vídeo termina chama handleNext)
      timerRef.current && clearTimeout(timerRef.current);
    }
    // Limpeza
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line
  }, [currentIndex]);

  // Passar para próximo item
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sequence.length);
    setIsPlaying(true); // só para garantir autoplay
  }, [sequence.length]);

  // Passar para anterior
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sequence.length) % sequence.length);
    setIsPlaying(true);
  }, [sequence.length]);

  // Tela cheia
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement && playerRef.current && playerRef.current.requestFullscreen) {
      playerRef.current.requestFullscreen();
      setIsFullScreen(true);
      setShowControls(false);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
      setShowControls(true);
      setTapCount(0);
    }
  }, []);

  // Tap para sair tela cheia
  const handleTap = useCallback(() => {
    if (!isFullScreen) return;
    setTapCount(n => n + 1);

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => setTapCount(0), 2000);
    if (tapCount + 1 >= 6 && document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
      setShowControls(true);
      setTapCount(0);
    }
  }, [isFullScreen, tapCount]);

  // Handler for image loading errors
  const handleImageError = useCallback(() => {
    setImgError(true);
    console.error("Image failed to load:", sequence[currentIndex]?.url);
    // If image fails to load, wait 2 seconds then advance to next item
    setTimeout(() => handleNext(), 2000);
  }, [currentIndex, sequence, handleNext]);

  // Limpeza dos timers
  useEffect(() => {
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      tapTimerRef.current && clearTimeout(tapTimerRef.current);
    };
  }, []);

  // Escuta mudança de fullscreen
  useEffect(() => {
    const onFull = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        setShowControls(true);
        setTapCount(0);
      }
    };
    document.addEventListener('fullscreenchange', onFull);
    return () => document.removeEventListener('fullscreenchange', onFull);
  }, []);

  // Guard contra array vazio
  if (!sequence || sequence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black rounded-lg">
        <p className="text-white">Sem vídeos ou imagens para exibir.</p>
      </div>
    );
  }

  const currentItem = sequence[currentIndex];

  return (
    <div
      ref={playerRef}
      onClick={handleTap}
      className={`relative rounded-lg overflow-hidden bg-black ${isFullScreen ? 'fullscreen' : ''}`}
      style={isFullScreen ? { width: '100vw', height: '100vh' } : undefined}
    >
      {currentItem.type === 'video' ? (
        <ReactPlayer
          url={currentItem.url}
          playing={isPlaying}
          controls={false}
          loop={false}
          width="100%"
          height={isFullScreen ? "100vh" : "450px"}
          onEnded={handleNext}
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
      ) : (
        <div
          style={{
            width: '100%',
            height: isFullScreen ? '100vh' : '450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111'
          }}
        >
          {imgError ? (
            <div className="text-white bg-black/50 p-4 rounded">
              Não foi possível carregar esta imagem.
              <br />
              Avançando automaticamente...
            </div>
          ) : (
            /* Imagem com error handling */
            <img
              src={currentItem.url}
              alt={currentItem.title}
              onError={handleImageError}
              style={{
                maxHeight: isFullScreen ? '80vh' : '400px',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          )}
        </div>
      )}
      {showControls && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            onClick={handlePrev}
            className="bg-black/70 hover:bg-black/90"
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          {currentItem.type === 'video' && (
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black/70 hover:bg-black/90"
              variant="outline"
              size="sm"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          <Button
            onClick={toggleFullScreen}
            className="bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Tela cheia
          </Button>
          <Button
            onClick={handleNext}
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
      <div className="absolute bottom-4 left-4 text-white font-bold drop-shadow-md text-lg bg-black/40 px-2 py-1 rounded">
        {currentItem.title}
      </div>
    </div>
  );
};

export default VideoPlayer;
