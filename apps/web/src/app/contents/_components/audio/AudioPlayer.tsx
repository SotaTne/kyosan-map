"use client";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Track = { src: string; title: string } | null;

export function AudioPlayer({ track }: { track: Track }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // 時間更新でプログレスバーを更新
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, []);

  // トラック変更で再生
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track) {
      audio.src = track.src;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      // トラックが無ければ停止＆非表示
      audio.pause();
      audio.removeAttribute("src");
      setIsPlaying(false);
      setProgress(0);
    }
  }, [track]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  // トラックが無ければ何も描画しない
  if (!track) return null;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-3 flex items-center gap-3"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <button onClick={togglePlay} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-medium truncate">{track.title}</span>
          <div className="w-full h-1 bg-gray-600 rounded mt-1">
            <div className="h-1 bg-green-400 rounded" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </motion.div>
    </>
  );
}
