
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const VideoForm = ({ onVideoAdded }: { onVideoAdded: () => void }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    // Basic validation for YouTube and other video URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const genericUrlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    
    return youtubeRegex.test(url) || genericUrlRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "URL inválida",
        description: "Por favor insira uma URL válida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "videos"), {
        title,
        url,
        userId: user?.uid,
        createdAt: new Date()
      });
      
      toast({
        title: "Vídeo adicionado",
        description: "Seu vídeo foi adicionado com sucesso!",
      });
      
      // Reset form fields
      setTitle('');
      setUrl('');
      
      // Notify parent component to refresh video list
      onVideoAdded();
    } catch (error) {
      console.error("Error adding video: ", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o vídeo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Adicionar Novo Vídeo</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Vídeo</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do vídeo" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL do Vídeo</Label>
            <Input 
              id="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="Link do YouTube ou outra fonte de vídeo"
              required
            />
            <p className="text-xs text-muted-foreground">
              Aceita links do YouTube e outros domínios de vídeo
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Adicionando..." : "Adicionar Vídeo"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default VideoForm;
