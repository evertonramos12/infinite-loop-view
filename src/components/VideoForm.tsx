
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { validateImageUrl, validateVideoUrl, normalizeUrl, MediaType } from '@/utils/mediaValidation';
import MediaTypeSelector from './MediaTypeSelector';
import MediaUrlInput from './MediaUrlInput';

interface VideoFormProps {
  onVideoAdded: () => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ onVideoAdded }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
        description: "Coloque uma URL válida de vídeo (Canva, YouTube etc)",
        variant: "destructive",
      });
      return;
    }

    if (mediaType === 'image' && !validateImageUrl(url)) {
      toast({
        title: "URL de imagem inválida",
        description: "Aceito formatos: .jpg, .jpeg, .png, .gif, .webp, Canva, postimg.cc",
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
          <MediaTypeSelector mediaType={mediaType} setMediaType={setMediaType} />
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
          <MediaUrlInput mediaType={mediaType} url={url} setUrl={setUrl} />
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
