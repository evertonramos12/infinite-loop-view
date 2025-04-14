
import { useEffect, useState } from 'react';

// Interface for video objects
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

// Hook for handling offline storage functionality
export const useOfflineStorage = (enabled: boolean) => {
  const [cachedVideos, setCachedVideos] = useState<string[]>([]);

  // Load cached video IDs from localStorage on component mount
  useEffect(() => {
    const storedCache = localStorage.getItem('cachedVideos');
    if (storedCache) {
      setCachedVideos(JSON.parse(storedCache));
    }
  }, []);

  // Function to cache a video for offline use
  const cacheVideo = async (video: Video): Promise<boolean> => {
    if (!enabled || !('caches' in window)) {
      return false;
    }
    
    try {
      // Skip YouTube videos as they can't be easily cached
      if (video.url.includes('youtube.com') || video.url.includes('youtu.be')) {
        console.log('YouTube videos cannot be cached for offline use');
        return false;
      }
      
      // Create a cache for videos if it doesn't exist
      const cache = await caches.open('video-cache');
      
      // Check if the video is already cached
      const isCached = cachedVideos.includes(video.id);
      if (isCached) {
        return true;
      }
      
      // Fetch and cache the video
      const response = await fetch(video.url);
      await cache.put(video.url, response);
      
      // Update the list of cached videos
      const updatedCachedVideos = [...cachedVideos, video.id];
      setCachedVideos(updatedCachedVideos);
      localStorage.setItem('cachedVideos', JSON.stringify(updatedCachedVideos));
      
      console.log(`Video "${video.title}" saved for offline viewing`);
      return true;
    } catch (error) {
      console.error('Error caching video:', error);
      return false;
    }
  };

  // Function to clear all cached videos
  const clearCache = async (): Promise<boolean> => {
    try {
      await caches.delete('video-cache');
      localStorage.removeItem('cachedVideos');
      setCachedVideos([]);
      console.log('Video cache cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  };

  return {
    cachedVideos,
    cacheVideo,
    clearCache,
    isVideoCached: (videoId: string) => cachedVideos.includes(videoId)
  };
};
