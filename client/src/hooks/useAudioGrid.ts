import { useEffect } from "react";
import { useAudio } from "./useAudio";
import { useSequencer } from "./useSequencer";

export function useAudioGrid(columns: number, tempo: number) {
  // Get audio functionality
  const { 
    sampleNames,
    volume,
    playbackRate,
    playSample,
    increaseVolume,
    decreaseVolume, 
    increaseSpeed,
    decreaseSpeed
  } = useAudio();
  
  // Create sequencer with audio playback
  const {
    grid,
    isPlaying,
    isPaused,
    currentColumn,
    looping,
    toggleCell,
    start,
    pause,
    stop,
    reset,
    toggleLoop,
    setPlaybackRate,
    clearAllCells
  } = useSequencer(sampleNames.length, columns, tempo, playSample);
  
  // Sync playback rate between audio and sequencer
  useEffect(() => {
    setPlaybackRate(playbackRate);
  }, [playbackRate, setPlaybackRate]);
  
  return {
    sampleNames,
    grid,
    isPlaying,
    isPaused,
    currentColumn,
    volume,
    playbackRate,
    looping,
    toggleCell,
    playSample,
    start,
    pause, 
    stop,
    reset,
    increaseVolume,
    decreaseVolume,
    increaseSpeed,
    decreaseSpeed,
    toggleLoop,
    clearAllCells
  };
}