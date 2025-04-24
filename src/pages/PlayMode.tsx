import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Video {
  id: string;
  url: string;
  title: string;
}

const PlayMode = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to fetch videos
  const fetchVideos = () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const videoQuery = query(
        collection(db, "videos"),
        where("userId", "==", user.uid)
      );
      
      const unsubscribe = onSnapshot(videoQuery, (snapshot) => {
        const videoList: Video[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          videoList.push({
            id: doc.id,
            title: data.title,
            url: data.url
          });
        });
        
        if (videoList.length === 0) {
          toast({
            title: "Sem vídeos",
            description: "Adicione vídeos antes de entrar no modo de exibição",
          });
          navigate('/dashboard');
          return;
        }
        
        setVideos(videoList);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching videos: ", error);
        setError("Não foi possível carregar seus vídeos. Tente novamente mais tarde.");
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus vídeos",
          variant: "destructive",
        });
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching videos: ", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus vídeos",
        variant: "destructive",
      });
      
      // Try to load offline videos as fallback
      const offlineVideosStr = localStorage.getItem('offlineVideos');
      if (offlineVideosStr) {
        const offlineVideos = JSON.parse(offlineVideosStr);
        const videoList: Video[] = Object.keys(offlineVideos).map(id => ({
          id,
          url: offlineVideos[id],
          title: `Vídeo offline ${id}`
        }));
        
        if (videoList.length > 0) {
          setVideos(videoList);
          toast({
            title: "Carregando vídeos offline",
            description: "Exibindo vídeos salvos para visualização offline",
          });
        }
      }
    }
  };

  // Initial fetch and set up refresh interval
  useEffect(() => {
    const unsubscribe = fetchVideos();
    
    // Set up 30-minute refresh interval
    const refreshInterval = setInterval(() => {
      fetchVideos();
      toast({
        title: "Atualizando lista",
        description: "Buscando novos vídeos...",
      });
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
    
    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [user, navigate, toast]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black flex flex-col">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="text-white border-white bg-black/50 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Button>
          
          {isOffline && (
            <Alert variant="destructive" className="bg-black/70 text-white border-red-500 p-2 flex items-center">
              <WifiOff className="h-4 w-4 mr-2" />
              <AlertTitle className="text-sm">Modo Offline</AlertTitle>
            </Alert>
          )}
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          {loading ? (
            <p className="text-white">Carregando os vídeos...</p>
          ) : videos.length > 0 ? (
            <div className="w-full max-w-5xl mx-auto">
              <VideoPlayer videos={videos} />
            </div>
          ) : (
            <div className="text-center text-white p-8 bg-black/50 rounded-lg">
              <WifiOff className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Sem vídeos disponíveis</h2>
              <p>
                {isOffline 
                  ? "Você está offline e não tem vídeos salvos para visualização offline." 
                  : "Você não tem vídeos cadastrados. Adicione vídeos no painel."}
              </p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Ir para o Painel
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PlayMode;
