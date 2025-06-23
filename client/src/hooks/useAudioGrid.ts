import { useState, useEffect, useCallback, useRef } from "react";
import { fetchSampleMap } from "../utils/fetchSampleMap";

export function useAudioGrid(columns: number, tempo: number) {
  // Existing states
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(-1);
  const [sampleMap, setSampleMap] = useState<Record<string, string>>({});
  
  // New states for enhanced controls
  const [volume, setVolume] = useState(0.8); // 0 to 1.0
  const [playbackRate, setPlaybackRate] = useState(1.0); // 0.25 to 2.0
  const [looping, setLooping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<AudioBuffer[]>([]);
  const timerIdRef = useRef<number | null>(null);
  
  // Setup audio context and gain node for volume control
  useEffect(() => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);
  
  // Load sample map and audio buffers
  useEffect(() => {
    fetchSampleMap("http://localhost:3001/api/samples")
      .then((data) => {
        setSampleMap(data);
        const names = Object.keys(data);
        setSampleNames(names);
        
        // Initialize grid
        const newGrid = Array(names.length).fill(0).map(() => 
          Array(columns).fill(false)
        );
        setGrid(newGrid);
        
        // Now load the samples
        loadSamples(names, data);
      })
      .catch((err) => {
        console.error("Failed to fetch sample map:", err);
      });
  }, [columns]);
  
  // Function to load samples
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
        console.error(`Error loading sample ${name}:`, error);
        buffers.push(await ctx.createBuffer(2, 1, 44100));
      }
    }
    
    audioBuffersRef.current = buffers;
  };

  // Toggle cell state (on/off)
  const toggleCell = useCallback((rowIndex: number, colIndex: number) => {
    if (rowIndex < 0 || rowIndex >= grid.length || colIndex < 0 || colIndex >= columns) {
      return;
    }
    
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[rowIndex] = [...newGrid[rowIndex]];
      newGrid[rowIndex][colIndex] = !newGrid[rowIndex][colIndex];
      return newGrid;
    });
  }, [grid, columns]);

  // Play a single sample
  const playSample = useCallback((sampleIndex: number) => {
    if (!audioContextRef.current || !audioBuffersRef.current[sampleIndex] || !gainNodeRef.current) {
      return;
    }
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffersRef.current[sampleIndex];
    source.playbackRate.value = playbackRate;
    source.connect(gainNodeRef.current); // Connect to gain node for volume control
    source.start();
  }, [playbackRate]);

  // Start playback
  const start = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIsPaused(false);
    
    // If not resuming from pause, start from the beginning
    if (currentColumn === -1) {
      setCurrentColumn(0);
    }
    
    const intervalTime = (60 / tempo) * 1000 / (2 * playbackRate); // Adjust timing with playback rate
    
    const playColumn = (col: number) => {
      // Play all active cells in this column
      for (let row = 0; row < grid.length; row++) {
        if (grid[row][col]) {
          playSample(row);
        }
      }
      
      // Schedule next column
      const nextCol = (col + 1) % columns;
      
      // If we've reached the end and not looping, stop
      if (nextCol === 0 && !looping) {
        stop();
        return;
      }
      
      timerIdRef.current = window.setTimeout(() => {
        setCurrentColumn(nextCol);
        playColumn(nextCol);
      }, intervalTime);
    };
    
    playColumn(currentColumn >= 0 ? currentColumn : 0);
  }, [isPlaying, tempo, grid, columns, playSample, currentColumn, playbackRate, looping]);

  // Pause playback
  const pause = useCallback(() => {
    if (!isPlaying || isPaused) return;
    
    setIsPaused(true);
    setIsPlaying(false);
    
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    
    // Keep currentColumn as is to resume from same position
  }, [isPlaying, isPaused]);

  // Stop playback
  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentColumn(-1);
    
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);
  
  // Reset playback position
  const reset = useCallback(() => {
    setCurrentColumn(0);
    
    if (isPlaying) {
      pause(); // Pause first if playing
      setCurrentColumn(0); // Set position to start
      setTimeout(start, 0); // Then restart
    }
  }, [isPlaying, pause, start]);

  // Volume controls
  const increaseVolume = useCallback(() => {
    setVolume(prev => Math.min(1.0, prev + 0.1));
  }, []);
  
  const decreaseVolume = useCallback(() => {
    setVolume(prev => Math.max(0.0, prev - 0.1));
  }, []);
  
  // Speed controls
  const increaseSpeed = useCallback(() => {
    setPlaybackRate(prev => Math.min(2.0, prev + 0.25));
  }, []);
  
  const decreaseSpeed = useCallback(() => {
    setPlaybackRate(prev => Math.max(0.25, prev - 0.25));
  }, []);
  
  // Loop toggle
  const toggleLoop = useCallback(() => {
    setLooping(prev => !prev);
  }, []);

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
    start,
    pause,
    stop,
    reset,
    increaseVolume,
    decreaseVolume,
    increaseSpeed,
    decreaseSpeed,
    toggleLoop,
  };
}