
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VideoControlsProps {
  autoPlayNextVideo: boolean;
  onAutoPlayToggle: (enabled: boolean) => void;
  offlineStorageEnabled: boolean;
  onOfflineStorageToggle: (enabled: boolean) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  autoPlayNextVideo,
  onAutoPlayToggle,
  offlineStorageEnabled,
  onOfflineStorageToggle
}) => {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="autoplay"
            checked={autoPlayNextVideo}
            onCheckedChange={onAutoPlayToggle}
          />
          <Label htmlFor="autoplay">Reprodução automática (loop da fila)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="offline-storage"
            checked={offlineStorageEnabled}
            onCheckedChange={onOfflineStorageToggle}
          />
          <Label htmlFor="offline-storage">Armazenar vídeos offline</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoControls;
