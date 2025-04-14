
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Video {
  id: string;
  url: string;
  title: string;
}

const PlayMode = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      
      try {
        const videoQuery = query(
          collection(db, "videos"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(videoQuery);
        const videoList: Video[] = [];
        
        querySnapshot.forEach((doc) => {
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
      } catch (error) {
        console.error("Error fetching videos: ", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus vídeos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user, navigate, toast]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black flex flex-col">
        <div className="absolute top-4 left-4 z-10">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="text-white border-white bg-black/50 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Button>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          {loading ? (
            <p className="text-white">Carregando os vídeos...</p>
          ) : (
            <div className="w-full max-w-5xl mx-auto">
              <VideoPlayer videos={videos} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PlayMode;
