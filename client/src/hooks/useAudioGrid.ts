import { useRef, useState, useEffect, useCallback } from "react";
import { useSampleMap } from "./useSampleMap";
import { useAudioBuffers } from "./useAudioBuffers";

const API_URL = "http://localhost:3001/api/samples";
const SAMPLES_BASE_URL = "http://localhost:3001/samples";

export function useAudioGrid(columns: number, tempo: number) {
  const {
    sampleMap,
    sampleNames,
    grid,
    setGrid,
    error: sampleError,
  } = useSampleMap(API_URL, columns);

  const {
    audioCtxRef,
    buffersRef,
    error: bufferError,
  } = useAudioBuffers(sampleNames, sampleMap, SAMPLES_BASE_URL);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(0);

  const animationFrameRef = useRef<number | null>(null);
  const visualAnimationFrameRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  const lastVisualTimeRef = useRef<number>(0);
  const gridRef = useRef<boolean[][]>([]);
  const currentColumnRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { currentColumnRef.current = currentColumn; }, [currentColumn]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (visualAnimationFrameRef.current) cancelAnimationFrame(visualAnimationFrameRef.current);
    };
  }, []);

  const toggleCell = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => [...r]);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  };

  const playSound = (buffer: AudioBuffer) => {
    if (!audioCtxRef.current) return;
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.start();
  };

  const updateVisual = useCallback((timestamp: number) => {
    if (!lastVisualTimeRef.current) lastVisualTimeRef.current = timestamp;
    if (timestamp - lastVisualTimeRef.current >= 100) {
      setCurrentColumn(currentColumnRef.current);
      lastVisualTimeRef.current = timestamp;
    }
    if (isPlayingRef.current) {
      visualAnimationFrameRef.current = requestAnimationFrame(updateVisual);
    }
  }, []);

  const step = useCallback((timestamp: number) => {
    const intervalMs = (60_000 / tempo) / 4;
    if (!lastStepTimeRef.current) lastStepTimeRef.current = timestamp;
    if (timestamp - lastStepTimeRef.current >= intervalMs) {
      const col = currentColumnRef.current;
      gridRef.current.forEach((row, rowIndex) => {
        if (row[col]) {
          const buffer = buffersRef.current[rowIndex];
          if (buffer) playSound(buffer);
        }
      });
      currentColumnRef.current = (currentColumnRef.current + 1) % columns;
      lastStepTimeRef.current = timestamp;
    }
    if (isPlayingRef.current) {
      animationFrameRef.current = requestAnimationFrame(step);
    }
  }, [tempo, columns]);

  const start = () => {
    audioCtxRef.current?.resume();
    setIsPlaying(true);
    currentColumnRef.current = 0;
    lastStepTimeRef.current = 0;
    lastVisualTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(step);
    visualAnimationFrameRef.current = requestAnimationFrame(updateVisual);
  };

  const stop = () => {
    setIsPlaying(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (visualAnimationFrameRef.current) cancelAnimationFrame(visualAnimationFrameRef.current);
    setCurrentColumn(0);
    currentColumnRef.current = 0;
  };

  return {
    sampleNames,
    grid,
    isPlaying,
    currentColumn,
    toggleCell,
    start,
    stop,
    error: sampleError || bufferError,
  };
}