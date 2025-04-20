
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface VideoFormProps {
  onVideoAdded: () => void;
}

type MediaType = 'video' | 'image';

const VideoForm: React.FC<VideoFormProps> = ({ onVideoAdded }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Simple image url validation (accepts .jpg, .jpeg, .png, .gif, .webp)
  const validateImageUrl = (value: string) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      return /\.(jpe?g|png|gif|webp)$/i.test(url.pathname);
    } catch {
      // Try with https://
      try {
        const url = new URL('https://' + value);
        return /\.(jpe?g|png|gif|webp)$/i.test(url.pathname);
      } catch {
        return false;
      }
    }
  };

  const validateVideoUrl = (value: string) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      try {
        new URL('https://' + value);
        return true;
      } catch {
        return false;
      }
    }
  };

  const normalizeUrl = (value: string) => {
    // Tenta normalizar a URL para ter https://
    try {
      new URL(value);
      return value;
    } catch {
      try {
        new URL('https://' + value);
        return 'https://' + value;
      } catch {
        return value;
      }
    }
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

    if (mediaType === 'video' && !validateVideoUrl(url)) {
      toast({
        title: "URL de vídeo inválida",
        description: "Coloque uma URL válida de vídeo",
        variant: "destructive",
      });
      return;
    }

    if (mediaType === 'image' && !validateImageUrl(url)) {
      toast({
        title: "URL de imagem inválida",
        description: "Aceito formatos: .jpg, .jpeg, .png, .gif, .webp",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar mídia",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedUrl = normalizeUrl(url);

      await addDoc(collection(db, "videos"), {
        title,
        url: normalizedUrl,
        userId: user.uid,
        createdAt: new Date(),
        active: true,
        category: "default",
        type: mediaType
      });

      toast({
        title: mediaType === "image" ? "Imagem adicionada" : "Vídeo adicionado",
        description: `Sua ${mediaType === "image" ? "imagem" : "vídeo"} foi adicionada!`
      });

      setTitle('');
      setUrl('');
      setMediaType('video');
      onVideoAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a mídia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Adicionar Nova Mídia</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                value="video"
                checked={mediaType === 'video'}
                onChange={() => setMediaType('video')}
                className="mr-1"
              />
              <span>Vídeo</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                value="image"
                checked={mediaType === 'image'}
                onChange={() => setMediaType('image')}
                className="mr-1"
              />
              <span>Imagem</span>
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Título da ${mediaType === 'video' ? 'vídeo' : 'imagem'}`}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">{mediaType === 'video' ? 'URL do Vídeo' : 'URL da Imagem'}</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={mediaType === 'video' ? "Link do YouTube ou outra fonte de vídeo" : "Link direto da imagem (.jpg, .png, etc)"}
              required
            />
            <p className="text-xs text-muted-foreground">
              {mediaType === 'video'
                ? "Aceita links do YouTube e outros domínios de vídeo"
                : "Aceito formatos: .jpg, .jpeg, .png, .gif, .webp"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Adicionando..." : `Adicionar ${mediaType === "image" ? "Imagem" : "Vídeo"}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default VideoForm;

