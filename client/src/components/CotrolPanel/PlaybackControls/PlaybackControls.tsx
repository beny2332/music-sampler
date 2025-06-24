import React from "react";

type PlaybackControlsProps = {
  isPlaying: boolean;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  clearAllCells?: () => void;
};

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying, start, pause, stop, reset, clearAllCells
}) => {
    const handleClear = () => {
    if (clearAllCells && window.confirm("Are you sure you want to clear the grid?")) {
      clearAllCells();
    }
  };
  return (
  <div className="control-group">
    <button 
      onClick={isPlaying ? pause : start} 
      className="control-button"
      title={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? "⏸️" : "▶️"}
    </button>
    <button onClick={stop} className="control-button" title="Stop">
      ⏹️
    </button>
    <button onClick={reset} className="control-button" title="Reset to beginning">
      ⏮️
    </button>
     {clearAllCells && (
        <button 
          onClick={handleClear} 
          className="control-button danger"
          title="Clear all cells"
        >
          🗑️
        </button>
      )}
  </div>
);
};

export default PlaybackControls;