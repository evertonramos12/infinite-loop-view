
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
          : "Link direto de qualquer imagem (site.com.br/imagem.jpg)"
      }
      required
    />
    <p className="text-xs text-muted-foreground">
      {mediaType === 'video'
        ? "Aceita links do YouTube, Canva e outros domínios de vídeo"
        : "Aceita qualquer URL direta de imagem (.jpg, .png, etc), sites como Canva, postimg.cc e outros"}
    </p>
  </div>
);

export default MediaUrlInput;
