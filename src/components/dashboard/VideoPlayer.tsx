
import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Video {
  id: string;
  title: string;
  url: string;
  date: {
    seconds: number;
    nanoseconds: number;
  };
  userId?: string;
}

interface VideoPlayerProps {
  currentVideo: Video | null;
  videos: Video[];
  autoPlayNextVideo: boolean;
  onVideoEnd: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  currentVideo, 
  videos, 
  autoPlayNextVideo, 
  onVideoEnd 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Function to check if URL is from YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Handle video end event
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleVideoEnd = () => {
      if (autoPlayNextVideo) {
        onVideoEnd();
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      
      // Cleanup
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [autoPlayNextVideo, onVideoEnd]);

  // If no video is selected
  if (!currentVideo) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <CardContent>
          <p className="text-center text-gray-500">Selecione um vídeo para reproduzir</p>
        </CardContent>
      </Card>
    );
  }

  // Render YouTube embed
  if (isYouTubeUrl(currentVideo.url)) {
    const videoId = getYouTubeVideoId(currentVideo.url);
    
    if (!videoId) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{currentVideo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>URL do YouTube inválida</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{currentVideo.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render direct video player
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{currentVideo.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-full"
            src={currentVideo.url}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
