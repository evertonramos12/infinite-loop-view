
import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import VideoForm from '@/components/VideoForm';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, LogOut, Play, Link, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Video {
  id: string;
  url: string;
  title: string;
  userId: string;
  createdAt: Date;
  active?: boolean;
  category?: string;
}

const Dashboard = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchVideos = async () => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Simplify the query to avoid index requirements
      const videoQuery = query(
        collection(db, "videos"),
        where("userId", "==", auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(videoQuery);
      const videoList: Video[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videoList.push({
          id: doc.id,
          title: data.title,
          url: data.url,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          active: data.active === undefined ? true : data.active,
          category: data.category || 'default'
        });
      });
      
      // Sort videos client-side
      videoList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setVideos(videoList);
    } catch (error) {
      console.error("Error fetching videos: ", error);
      setError("Não foi possível carregar seus vídeos. Tente novamente mais tarde.");
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
    if (user) {
      fetchVideos();
    }
  }, [user]);

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
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
              <Card>
                <CardHeader>
                  <CardTitle>Seus Vídeos</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Erro</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {loading ? (
                    <p className="text-center py-4">Carregando seus vídeos...</p>
                  ) : videos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {videos.map((video) => (
                          <TableRow key={video.id}>
                            <TableCell className="font-medium">{video.title}</TableCell>
                            <TableCell className="truncate max-w-[200px]">
                              <div className="flex items-center">
                                <Link className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{video.url}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(video.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVideo(video.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center py-8">Você ainda não tem vídeos cadastrados. Adicione um novo vídeo para começar.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
