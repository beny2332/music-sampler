import React from "react";
import GridCell from "./GridCell";
import { useAudioGrid } from "../hooks/useAudioGrid";
import "./AudioGrid.css"; // Import the CSS file

type AudioGridProps = {
  columns: number;
  tempo: number;
};

const AudioGrid: React.FC<AudioGridProps> = ({ columns, tempo }) => {
  const {
    sampleNames,
    grid,
    isPlaying,
    currentColumn,
    toggleCell,
    start,
    stop,
  } = useAudioGrid(columns, tempo);

  if (grid.length === 0) {
    return <p style={{ padding: 20 }}>⏳ Loading grid...</p>;
  }

  return (
    <div className="audio-grid-container">
      <p className="audio-grid-info">
        Rows: {grid.length}, Cols: {columns}
      </p>
      <button onClick={isPlaying ? stop : start}>
        {isPlaying ? "Stop" : "Play"}
      </button>
      <div style={{ marginTop: 16 }}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="audio-grid-row">
            <div className="audio-grid-sample-name">{sampleNames[rowIndex]}</div>
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