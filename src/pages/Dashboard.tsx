
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

import VideoList from '@/components/dashboard/VideoList';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import VideoControls from '@/components/dashboard/VideoControls';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

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

const Dashboard = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [autoPlayNextVideo, setAutoPlayNextVideo] = useState(false);
  const [offlineStorageEnabled, setOfflineStorageEnabled] = useState(false);
  
  const { toast } = useToast();
  const { cacheVideo, isVideoCached } = useOfflineStorage(offlineStorageEnabled);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch videos from firestore
  useEffect(() => {
    const fetchVideos = async () => {
      if (!currentUser) return;

      try {
        const videosCollection = collection(db, 'videos');
        const q = query(
          videosCollection,
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const videosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Video));
        
        setVideos(videosList);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar seus vídeos',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchVideos();
    }
  }, [currentUser, toast]);

  // Handle offline storage when toggled
  useEffect(() => {
    const cacheVideos = async () => {
      if (offlineStorageEnabled && videos.length > 0) {
        for (const video of videos) {
          if (!isVideoCached(video.id)) {
            await cacheVideo(video);
          }
        }
        toast({
          title: 'Armazenamento Offline',
          description: 'Seus vídeos foram salvos para visualização offline'
        });
      }
    };

    if (offlineStorageEnabled) {
      cacheVideos();
    }
  }, [offlineStorageEnabled, videos, cacheVideo, isVideoCached, toast]);

  // Handle playing a video
  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
  };

  // Handle deleting a video
  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      setVideos(videos.filter(video => video.id !== id));
      
      if (currentVideo && currentVideo.id === id) {
        setCurrentVideo(null);
      }
      
      toast({
        title: 'Vídeo excluído',
        description: 'O vídeo foi excluído com sucesso'
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir o vídeo',
        variant: 'destructive'
      });
    }
  };

  // Handle video end - play the next video if autoplay is enabled
  const handleVideoEnd = () => {
    if (!autoPlayNextVideo || !currentVideo || videos.length <= 1) return;
    
    const currentIndex = videos.findIndex(video => video.id === currentVideo.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    setCurrentVideo(videos[nextIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VideoPlayer
            currentVideo={currentVideo}
            videos={videos}
            autoPlayNextVideo={autoPlayNextVideo}
            onVideoEnd={handleVideoEnd}
          />
          
          <div className="mt-4">
            <VideoControls
              autoPlayNextVideo={autoPlayNextVideo}
              onAutoPlayToggle={setAutoPlayNextVideo}
              offlineStorageEnabled={offlineStorageEnabled}
              onOfflineStorageToggle={setOfflineStorageEnabled}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <VideoList
            videos={videos}
            onDelete={handleDeleteVideo}
            onPlay={handlePlayVideo}
          />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Dashboard;
