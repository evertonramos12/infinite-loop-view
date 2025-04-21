
import React from 'react';
import { MediaType } from '@/utils/mediaValidation';

interface MediaTypeSelectorProps {
  mediaType: MediaType;
  setMediaType: (type: MediaType) => void;
}

const MediaTypeSelector: React.FC<MediaTypeSelectorProps> = ({ mediaType, setMediaType }) => (
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
);

export default MediaTypeSelector;
