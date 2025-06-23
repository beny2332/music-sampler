import { useEffect, useRef, useState } from "react";
import { loadAudioBuffers } from "../utils/loadAudioBuffers";

export function useAudioBuffers(
  sampleNames: string[],
  sampleMap: Record<string, string>,
  baseUrl: string
) {
  const [error, setError] = useState<string | null>(null);
  const buffersRef = useRef<AudioBuffer[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (sampleNames.length === 0) return;
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    loadAudioBuffers(audioCtxRef.current, sampleNames, sampleMap, baseUrl)
      .then((buffers) => {
        buffersRef.current = buffers;
      })
      .catch((err) => {
        setError("Failed to load audio buffers");
        console.error(err);
      });

    return () => {
      audioCtxRef.current?.close();
    };
  }, [sampleNames, sampleMap, baseUrl]);

  return { audioCtxRef, buffersRef, error };
}