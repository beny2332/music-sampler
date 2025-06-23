import React from "react";
import GridCell from "../GridCell/GridCell";
import { useAudioGrid } from "../../hooks/useAudioGrid";
import "./AudioGrid.css"; 
import { formatSampleName } from "../../utils/formatSampleName";

type AudioGridProps = {
  columns: number;
  tempo: number;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  canAddColumn: boolean; 
  canRemoveColumn: boolean; 
};

const AudioGrid: React.FC<AudioGridProps> = ({ 
  columns, 
  tempo, 
  onAddColumn, 
  onRemoveColumn,
  canAddColumn = true,
  canRemoveColumn = true
}) => {
  const {
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
  } = useAudioGrid(columns, tempo);

  if (grid.length === 0) {
    return <p style={{ padding: 20 }}>⏳ Loading grid...</p>;
  }

  return (
    <div className="audio-grid-container">
      {/* Grid information */}
      <div className="audio-grid-info">
        <div>Columns: {columns}</div>
        <div>Current beat: {currentColumn >= 0 ? currentColumn + 1 : "-"}</div>
      </div>
      
      {/* Playback controls */}
      <div className="audio-grid-controls">
        <div className="control-group">
          <button 
            onClick={isPlaying ? pause : start} 
            className="control-button"
            title={isPlaying ? "Pause" : isPaused ? "Resume" : "Play"}
          >
            {isPlaying ? "⏸️" : isPaused ? "▶️" : "▶️"}
          </button>
          <button 
            onClick={stop} 
            className="control-button"
            title="Stop"
          >
            ⏹️
          </button>
          <button 
            onClick={reset} 
            className="control-button"
            title="Reset to beginning"
          >
            ⏮️
          </button>
        </div>
        
        {/* Loop Control */}
        <div className="control-group">
          <button 
            onClick={toggleLoop} 
            className={`control-button ${looping ? 'active' : ''}`}
            title={looping ? "Disable Loop" : "Enable Loop"}
          >
            {looping ? "🔄" : "↩️"}
          </button>
        </div>
        
        {/* Volume controls */}
        <div className="control-group">
          <button 
            onClick={decreaseVolume} 
            className="control-button"
            title="Decrease volume"
          >
            🔉
          </button>
          <div className="control-value">
            {Math.round(volume * 100)}%
          </div>
          <button 
            onClick={increaseVolume} 
            className="control-button"
            title="Increase volume"
          >
            🔊
          </button>
        </div>
        
        {/* Speed controls */}
        <div className="control-group">
          <button 
            onClick={decreaseSpeed} 
            className="control-button"
            title="Decrease speed"
          >
            🐢
          </button>
          <div className="control-value">
            {playbackRate.toFixed(2)}x
          </div>
          <button 
            onClick={increaseSpeed} 
            className="control-button"
            title="Increase speed"
          >
            🐰
          </button>
        </div>

        {/* Grid size controls */}
        <div className="control-group">
          <button 
            onClick={onRemoveColumn} 
            disabled={!canRemoveColumn}
            title="Remove column"
            className="control-button"
          >
            -
          </button>
          <button 
            onClick={onAddColumn}
            disabled={!canAddColumn}
            title="Add column"
            className="control-button"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Grid */}
      <div className="audio-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="audio-grid-row">
            <div className="audio-grid-sample-name">{formatSampleName(sampleNames[rowIndex])}</div>
            <div className="audio-grid-cells">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioGrid;