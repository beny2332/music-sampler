import { useState, useEffect, useRef, useCallback } from "react";
import { createGrid, resizeGrid, toggleGridCell, saveGridState, loadGridState, removeGridState } from "../utils/grid";
import { calculateBeatDuration } from "../utils/audio";
import { throttle } from "../utils/performance";

export function useSequencer(
  sampleCount: number,
  columns: number,
  tempo: number,
  playSample: (index: number) => void
) {
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(-1);
  const [looping, setLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const gridRef = useRef<boolean[][]>([]);
  const timerIdRef = useRef<number | null>(null);

  // Update grid ref when grid changes
  useEffect(() => {
    gridRef.current = grid;
    
    // Save grid state when it changes (debounced via the utility)
    if (grid.length > 0) {
      const timeoutId = setTimeout(() => {
        saveGridState(grid, tempo, columns);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [grid, tempo, columns]);

  // Initialize grid when sample count changes
  useEffect(() => {
    if (sampleCount > 0 && grid.length === 0) {
      // Try to load saved grid first
      const savedGrid = loadGridState();
      if (savedGrid && savedGrid.grid.length > 0) {
        // Adapt saved grid to current dimensions if needed
        if (savedGrid.grid.length === sampleCount && savedGrid.columns === columns) {
          setGrid(savedGrid.grid);
        } else {
          // Create new grid with saved data where possible
          const newGrid = createGrid(sampleCount, columns);
          for (let r = 0; r < Math.min(sampleCount, savedGrid.grid.length); r++) {
            for (let c = 0; c < Math.min(columns, savedGrid.columns); c++) {
              if (r < savedGrid.grid.length && c < savedGrid.grid[0].length) {
                newGrid[r][c] = savedGrid.grid[r][c];
              }
            }
          }
          setGrid(newGrid);
        }
      } else {
        // Create fresh grid if no saved data
        setGrid(createGrid(sampleCount, columns));
      }
    }
  }, [sampleCount, columns, grid.length]);

  // Handle column changes
  useEffect(() => {
    if (grid.length === 0 || grid.length !== sampleCount) return;
    
    setGrid(prevGrid => resizeGrid(prevGrid, columns));
  }, [columns, sampleCount]);

  // Create a throttled version of toggleCell for rapid clicking
  const throttledPlaySample = useRef(throttle(playSample, 50)).current;

  // Toggle cell state using utility function
  const toggleCell = useCallback((rowIndex: number, colIndex: number) => {
    if (rowIndex < 0 || rowIndex >= grid.length || colIndex < 0 || colIndex >= columns) {
      return;
    }
    
    setGrid(prevGrid => {
      const newGrid = toggleGridCell(prevGrid, rowIndex, colIndex);
      
      // Check if cell was turned ON (compare with previous)
      const wasActive = prevGrid[rowIndex][colIndex];
      const isNowActive = newGrid[rowIndex][colIndex];
      
      // Play preview sound when activating a cell
      if (!wasActive && isNowActive) {
        throttledPlaySample(rowIndex);
      }
      
      return newGrid;
    });
  }, [grid, columns, throttledPlaySample]);

  // Start playback using beat duration utility
  const start = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIsPaused(false);
    
    if (currentColumn === -1) {
      setCurrentColumn(0);
    }
    
    const intervalTime = calculateBeatDuration(tempo, playbackRate);
    
    const playColumn = (col: number) => {
      // Use gridRef for the latest grid state
      for (let row = 0; row < gridRef.current.length; row++) {
        if (gridRef.current[row][col]) {
          playSample(row);
        }
      }
      
      const nextCol = (col + 1) % columns;
      
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
  }, [isPlaying, currentColumn, tempo, columns, playbackRate, looping, playSample]);

  // Pause playback
  const pause = useCallback(() => {
    if (!isPlaying || isPaused) return;
    
    setIsPaused(true);
    setIsPlaying(false);
    
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
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
      pause();
      setCurrentColumn(0);
      setTimeout(start, 0);
    }
  }, [isPlaying, pause, start]);

  // Toggle loop mode
  const toggleLoop = useCallback(() => {
    setLooping(prev => !prev);
  }, []);

  // Update playback rate (exposed for external control)
  const setPlaybackRateValue = useCallback((rate: number) => {
    setPlaybackRate(rate);
  }, []);

  // Add function to clear grid using utility
  const clearAllCells = useCallback(() => {
    if (grid.length > 0) {
      setGrid(prevGrid => createGrid(prevGrid.length, prevGrid[0].length));
      removeGridState();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);

  return {
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
    setPlaybackRate: setPlaybackRateValue,
    clearAllCells
  };
}