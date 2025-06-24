import { useState, useEffect, useRef, useCallback } from "react";
import { fetchSampleMap } from "../utils/fetchSampleMap";
import { createAudioSource, calculateGainValue } from "../utils/audio";
import { createAudioError, AudioErrorType } from "../utils/errorHandling";
import { debounce } from "../utils/performance";

export function useAudio() {
  const [_sampleMap, setSampleMap] = useState<Record<string, string>>({});
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<AudioBuffer[]>([]);

  // Initialize audio context and set up event listeners
  useEffect(() => {
    try {
      // Don't create a new context if one exists and isn't closed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        return;
      }
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      // Add unlock audio logic
      const unlockAudio = () => {
        if (ctx.state === 'closed') return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(err => console.error("Error resuming context:", err));
        }
      };
      
      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);
      
      // Create gain node with calculated gain value
      const gainNode = ctx.createGain();
      gainNode.gain.value = calculateGainValue(volume);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;
      
      return () => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };
    } catch (err) {
      const audioError = createAudioError(
        AudioErrorType.CONTEXT_CREATION,
        "Failed to create audio context",
        err instanceof Error ? err : undefined
      );
      console.error(audioError.message, audioError.originalError);
      setError("Failed to initialize audio system");
    }
  }, [volume]);

  // Update volume with proper gain calculation
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = calculateGainValue(volume);
    }
  }, [volume]);

  // Fetch sample map and load samples
  useEffect(() => {
    fetchSampleMap("http://localhost:3001/api/samples")
      .then((data) => {
        setSampleMap(data);
        const names = Object.keys(data);
        setSampleNames(names);
        
        loadSamples(names, data);
      })
      .catch((err) => {
        const audioError = createAudioError(
          AudioErrorType.SAMPLE_LOAD,
          "Failed to load sample data",
          err instanceof Error ? err : undefined
        );
        console.error(audioError.message, audioError.originalError);
        setError("Failed to load audio samples");
      });
  }, []);

  // Load audio samples
  const loadSamples = async (names: string[], sampleMapping: Record<string, string>) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const buffers: AudioBuffer[] = [];
    
    for (const name of names) {
      try {
        const filename = sampleMapping[name];
        const response = await fetch(`http://localhost:3001/samples/${filename}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffers.push(audioBuffer);
      } catch (error) {
        const audioError = createAudioError(
          AudioErrorType.BUFFER_DECODE,
          `Error loading sample ${name}`,
          error instanceof Error ? error : undefined
        );
        console.error(audioError.message, audioError.originalError);
        // Create an empty buffer as a fallback
        buffers.push(await ctx.createBuffer(2, 1, 44100));
      }
    }
    
    audioBuffersRef.current = buffers;
  };

  // Play a sample using createAudioSource utility
  const playSample = useCallback((sampleIndex: number) => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        throw new Error("Audio context is closed or not available");
      }
      
      if (!audioBuffersRef.current[sampleIndex]) {
        throw new Error(`No buffer available for index: ${sampleIndex}`);
      }
      
      if (!gainNodeRef.current) {
        throw new Error("No gain node available");
      }
      
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Use createAudioSource utility instead of manual source creation
      const source = createAudioSource(
        audioContextRef.current, 
        audioBuffersRef.current[sampleIndex], 
        gainNodeRef.current, 
        { playbackRate }
      );
      
      source.start(0);
    } catch (err) {
      const audioError = createAudioError(
        AudioErrorType.PLAYBACK,
        "Failed to play audio sample",
        err instanceof Error ? err : undefined
      );
      console.error(audioError.message, audioError.originalError);
    }
  }, [playbackRate]);

  // Use debounced volume changes for better performance
  const debouncedVolumeChange = useRef(debounce((newVolume: number) => {
    setVolume(newVolume);
  }, 50)).current;

  // Volume controls with debounce for rapid changes
  const increaseVolume = useCallback(() => {
    debouncedVolumeChange(Math.min(1.0, volume + 0.1));
  }, [debouncedVolumeChange, volume]);
  
  const decreaseVolume = useCallback(() => {
    debouncedVolumeChange(Math.max(0.0, volume - 0.1));
  }, [debouncedVolumeChange, volume]);
  
  // Speed controls
  const increaseSpeed = useCallback(() => {
    setPlaybackRate(prev => Math.min(2.0, prev + 0.25));
  }, []);
  
  const decreaseSpeed = useCallback(() => {
    setPlaybackRate(prev => Math.max(0.25, prev - 0.25));
  }, []);

  return {
    sampleNames,
    volume,
    playbackRate,
    playSample,
    increaseVolume,
    decreaseVolume,
    increaseSpeed,
    decreaseSpeed,
    error
  };
}