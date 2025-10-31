import { useCallback, useEffect, useRef, useState } from "react";

export type CameraError = "fail-camera" | null;

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<CameraError>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    if (isStarting || isRunning) return;

    try {
      setIsStarting(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 9999 },
          height: { ideal: 9999 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsRunning(true);
    } catch (err) {
      console.error("Camera start error:", err);
      setError("fail-camera");
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isRunning]);

  const stopCamera = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsRunning(false);
  }, []);

  // iOS Safari対策: unmount時もストリームを維持
  useEffect(() => {
    return () => {
      // stream は停止しない
    };
  }, []);

  return {
    stream,
    isStarting,
    isRunning,
    error,
    startCamera,
    stopCamera,
  };
}
