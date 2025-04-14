
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Video {
  id: string;
  title: string;
  url: string;
  date: {
    seconds: number;
    nanoseconds: number;
  };
  userId?: string;
}

interface VideoListProps {
  videos: Video[];
  onDelete: (id: string) => void;
  onPlay: (video: Video) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, onDelete, onPlay }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meus Vídeos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum vídeo encontrado
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>{video.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{video.url}</TableCell>
                  <TableCell>
                    {video.date ? formatDate(new Date(video.date.seconds * 1000)) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => onPlay(video)}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => onDelete(video.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VideoList;
