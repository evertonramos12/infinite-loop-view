
import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import VideoForm from '@/components/VideoForm';
import { ProtectedRoute } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, LogOut, Play } from 'lucide-react';

interface Video {
  id: string;
  url: string;
  title: string;
  userId: string;
}

const Dashboard = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchVideos = async () => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      const videoQuery = query(
        collection(db, "videos"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(videoQuery);
      const videoList: Video[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videoList.push({
          id: doc.id,
          title: data.title,
          url: data.url,
          userId: data.userId
        });
      });
      
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

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso",
      });
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video: ", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o vídeo",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error: ", error);
      toast({
        title: "Erro",
        description: "Não foi possível sair da conta",
        variant: "destructive",
      });
    }
  };

  const handlePlayMode = () => {
    navigate('/play');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gray-900 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Infinite Loop Videos</h1>
            <div className="flex gap-2">
              {videos.length > 0 && (
                <Button 
                  onClick={handlePlayMode}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Modo de Exibição
                </Button>
              )}
              <Button 
                onClick={handleLogout} 
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <VideoForm onVideoAdded={fetchVideos} />
            </div>
            
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">Seus Vídeos</h2>
              
              {loading ? (
                <p>Carregando seus vídeos...</p>
              ) : videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg font-medium">{video.title}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-500 truncate mb-2">{video.url}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>Você ainda não tem vídeos cadastrados. Adicione um novo vídeo para começar.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
