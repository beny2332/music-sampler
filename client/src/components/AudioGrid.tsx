import React, { useEffect, useRef, useState, useCallback, memo } from "react";

type AudioGridProps = {
  columns: number;
  tempo: number; // in BPM
};

// Memoized cell component to prevent unnecessary re-renders
const GridCell = memo(({ 
  active, 
  isCurrent, 
  onClick 
}: { 
  active: boolean; 
  isCurrent: boolean; 
  onClick: () => void; 
}) => (
  <div
    onClick={onClick}
    style={{
      width: 30,
      height: 30,
      margin: 2,
      backgroundColor: active ? "#4caf50" : isCurrent ? "#ddd" : "#fff",
      border: "2px solid",
      borderColor: isCurrent ? "#2196f3" : active ? "#4caf50" : "#999",
      cursor: "pointer",
      transition: "background-color 0.2s, border-color 0.2s",
      boxSizing: "border-box", // Ensures consistent sizing regardless of border
    }}
  />
));

const AudioGrid: React.FC<AudioGridProps> = ({ columns, tempo }) => {
  const [sampleMap, setSampleMap] = useState<Record<string, string>>({});
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<AudioBuffer[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const visualAnimationFrameRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  const lastVisualTimeRef = useRef<number>(0);
  const gridRef = useRef<boolean[][]>([]);
  const currentColumnRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Keep gridRef in sync with grid state
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Fetch the sample map from the server
  useEffect(() => {
    fetch("http://localhost:3001/api/samples")
      .then((res) => res.json())
      .then((data) => {
        
        setSampleMap(data);
        const names = Object.keys(data);
        
        setSampleNames(names);
        setGrid(Array.from({ length: names.length }, () => Array(columns).fill(false)));
      })
      .catch((err) => console.error("Failed to fetch samples:", err));
  }, [columns]);

  // Load audio buffers
  useEffect(() => {
    if (sampleNames.length === 0) return;

    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    const loadSample = async (url: string) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return audioCtxRef.current!.decodeAudioData(arrayBuffer);
    };

    const loadAll = async () => {
      const buffers = await Promise.all(
        sampleNames.map((name) => loadSample(`http://localhost:3001/samples/${sampleMap[name]}`))
      );
      
      buffersRef.current = buffers;
    };

    loadAll();
  }, [sampleMap, sampleNames]);

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
  
  // Keep currentColumnRef in sync with currentColumn state
  useEffect(() => {
    currentColumnRef.current = currentColumn;
  }, [currentColumn]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Separate visual update loop (much slower)
  const updateVisual = useCallback((timestamp: number) => {
    if (!lastVisualTimeRef.current) lastVisualTimeRef.current = timestamp;
    
    // Update visual indicator every 100ms instead of every audio step
    if (timestamp - lastVisualTimeRef.current >= 100) {
      setCurrentColumn(currentColumnRef.current);
      lastVisualTimeRef.current = timestamp;
    }

    if (isPlayingRef.current) {
      visualAnimationFrameRef.current = requestAnimationFrame(updateVisual);
    }
  }, []);

  // Audio step function (no visual updates)
  const step = useCallback((timestamp: number) => {
    const intervalMs = (60_000 / tempo) / 4; // 16th notes
    if (!lastStepTimeRef.current) lastStepTimeRef.current = timestamp;

    if (timestamp - lastStepTimeRef.current >= intervalMs) {
      const col = currentColumnRef.current;
      
      // Play current column using gridRef.current
      gridRef.current.forEach((row, rowIndex) => {
        if (row[col]) {
          const buffer = buffersRef.current[rowIndex];
          if (buffer) {
            playSound(buffer);
          }
        }
      });

      // Update currentColumnRef directly (no state update)
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
    currentColumnRef.current = 0; // Reset to start
    lastStepTimeRef.current = 0;
    lastVisualTimeRef.current = 0;
    
    // Start both loops
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

  if (grid.length === 0) {
    return <p style={{ padding: 20 }}>⏳ Loading grid...</p>;
  }

  return (
    <div style={{ padding: 20, border: "1px solid red" }}>
      <p>Rows: {grid.length}, Cols: {columns}</p>
      <button onClick={isPlaying ? stop : start}>{isPlaying ? "Stop" : "Play"}</button>
      <div style={{ marginTop: 16 }}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 120 }}>{sampleNames[rowIndex]}</div>
            {row.map((cell, colIndex) => {
              const isCurrent = colIndex === currentColumn;
              return (
                <GridCell
                  key={colIndex}
                  active={cell}
                  isCurrent={isCurrent}
                  onClick={() => toggleCell(rowIndex, colIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioGrid;