
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaType } from '@/utils/mediaValidation';

interface MediaUrlInputProps {
  mediaType: MediaType;
  url: string;
  setUrl: (url: string) => void;
}

const MediaUrlInput: React.FC<MediaUrlInputProps> = ({ mediaType, url, setUrl }) => (
  <div className="space-y-2">
    <Label htmlFor="url">{mediaType === 'video' ? 'URL do Vídeo' : 'URL da Imagem'}</Label>
    <Input
      id="url"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      placeholder={
        mediaType === 'video'
          ? "Link do YouTube, Canva ou outro vídeo"
          : "Link do Canva, postimg.cc ou direto da imagem (.jpg, .png, etc)"
      }
      required
    />
    <p className="text-xs text-muted-foreground">
      {mediaType === 'video'
        ? "Aceita links do YouTube, Canva e outros domínios de vídeo"
        : "Aceito imagens do Canva, postimg.cc e links diretos de imagens (.jpg, .png, etc)"}
    </p>
  </div>
);

export default MediaUrlInput;
