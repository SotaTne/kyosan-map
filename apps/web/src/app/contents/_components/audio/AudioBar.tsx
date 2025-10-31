"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AudioBar({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current!;
    const onTime = () => a.duration && setProgress((a.currentTime / a.duration) * 100);
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-3 flex items-center gap-3">
      <audio ref={audioRef} src={src} autoPlay preload="metadata" />
      <button onClick={toggle} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div className="flex-1">
        <div className="text-sm truncate">{title}</div>
        <div className="w-full h-1 bg-gray-600 rounded mt-1">
          <div className="h-1 bg-green-400 rounded" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
