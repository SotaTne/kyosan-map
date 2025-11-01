"use client";

import { Button } from "@kyosan-map/ui/components/button";
import { Card } from "@kyosan-map/ui/components/card";
import { cn } from "@kyosan-map/ui/lib/utils";
import { Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AudioBar({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current!;
    const onTime = () => {
      if (a.duration) {
        setProgress((a.currentTime / a.duration) * 100);
        setCurrentTime(a.currentTime);
        setDuration(a.duration);
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.play().catch(() => setPlaying(false));
    return () => a.removeEventListener("timeupdate", onTime);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current!;
    if (playing) a.pause();
    else a.play();
    setPlaying(!playing);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + secs.toString().padStart(2, "0");
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-safe">
      <Card className="shadow-lg border-border/40 backdrop-blur-sm bg-background/95">
        <audio ref={audioRef} src={src} autoPlay preload="metadata" />
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            onClick={toggle}
            size="icon"
            variant="ghost"
            className="shrink-0 hover:bg-accent"
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            <span className="sr-only">{playing ? "一時停止" : "再生"}</span>
          </Button>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate mb-1.5">{title}</div>
            <div className="space-y-1">
              <div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary rounded-full transition-all",
                    playing && "duration-100"
                  )}
                  style={{ width: progress + "%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {onClose && (
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="shrink-0 hover:bg-accent"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">閉じる</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
