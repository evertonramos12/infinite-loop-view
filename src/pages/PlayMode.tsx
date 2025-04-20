
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Novo tipo:
type SequenceItem = {
  id: string;
  url: string;
  title: string;
  type: 'video' | 'image';
};

// Defina aqui as imagens estáticas a usar, no seu formato mais simples:
const STATIC_IMAGES: SequenceItem[] = [
  {
    id: 'img1',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=max&w=1000&q=80',
    title: 'Imagem Circuito',
    type: 'image'
  },
  {
    id: 'img2',
    url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=max&w=1000&q=80',
    title: 'Notebook',
    type: 'image'
  }
];

const PlayMode = () => {
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchSequence = async () => {
      if (!user) return;

      setLoading(true);

      // Offline: carrega somente do localStorage (para vídeos)
      if (isOffline) {
        const offlineVideosStr = localStorage.getItem('offlineVideos');
        let localVideos: SequenceItem[] = [];
        if (offlineVideosStr) {
          try {
            const offlineVideos = JSON.parse(offlineVideosStr);
            localVideos = Object.keys(offlineVideos).map(id => ({
              id,
              url: offlineVideos[id],
              title: `Vídeo offline ${id}`,
              type: 'video'
            }));
          } catch (err) {
            // ignora
          }
        }
        if (localVideos.length > 0) {
          setSequence([...STATIC_IMAGES, ...localVideos]);
          setLoading(false);
          return;
        } else {
          toast({
            title: "Sem conexão",
            description: "Você está offline e não há vídeos disponíveis para visualização offline",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Online: busca vídeos do firestore e mescla as imagens
      try {
        const videoQuery = query(
          collection(db, "videos"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(videoQuery);
        const videoList: SequenceItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          videoList.push({
            id: doc.id,
            title: data.title,
            url: data.url,
            type: 'video'
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

        // Junta imagens + vídeos
        setSequence([...STATIC_IMAGES, ...videoList]);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus vídeos",
          variant: "destructive",
        });
        setSequence([...STATIC_IMAGES]);
      } finally {
        setLoading(false);
      }
    };

    fetchSequence();
  }, [user, navigate, toast, isOffline]);

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
          ) : sequence.length > 0 ? (
            <div className="w-full max-w-5xl mx-auto">
              <VideoPlayer sequence={sequence} />
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

