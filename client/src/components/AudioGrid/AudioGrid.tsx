import React, { useState } from "react";
import { useAudioGrid } from "../../hooks/useAudioGrid";
import "./AudioGrid.css"; 
import ControlPanel from "../CotrolPanel/ControlPanel";
import GridRow from "../GridRow/GridRow";
import CategoryTabs from "../CotrolPanel/CategoryTabs/CategoryTabs";

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
  
  type CategoryName = "Drums" | "Hats" | "Percussion" | "Cymbals" | "Toms";

const instrumentCategories: Record<CategoryName, string[]> = {
  "Drums": ["Kick", "Snare", "Clap"],
  "Hats": ["Hihat", "Openhat", "Openhat_Acoustic"],
  "Percussion": ["Cowbell", "Perc_Hollow", "Perc_Tribal", "Shaker"],
  "Cymbals": ["Crash", "Ride"],
  "Toms": ["Tom_Analog", "Tom_Rototom"]
};

  const [activeCategories, setActiveCategories] = useState<CategoryName[]>(["Drums"]);

  const {
    sampleNames,
    grid,
    isPlaying,
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
    clearAllCells
  } = useAudioGrid(columns, tempo);

  const toggleCategory = (category: CategoryName) => {
    setActiveCategories(prev => {
      if (prev.includes(category)) {
        // Remove the category if it's already selected
        return prev.filter(c => c !== category);
      } else {
        // Add the category if it's not selected
        return [...prev, category];
      }
    });
  };

  // Modified to include instruments from any active category
const organizedInstruments = activeCategories.flatMap(category => {
  // Get all instruments in this category that exist in sampleNames
  return instrumentCategories[category].filter(
    name => sampleNames.includes(name)
  );
});


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
      
      {/* Control panel with all controls */}
      <ControlPanel
        isPlaying={isPlaying}
        looping={looping}
        volume={volume}
        playbackRate={playbackRate}
        canAddColumn={canAddColumn}
        canRemoveColumn={canRemoveColumn}
        start={start}
        pause={pause}
        stop={stop}
        reset={reset}
        toggleLoop={toggleLoop}
        increaseVolume={increaseVolume}
        decreaseVolume={decreaseVolume}
        increaseSpeed={increaseSpeed}
        decreaseSpeed={decreaseSpeed}
        onAddColumn={onAddColumn}
        onRemoveColumn={onRemoveColumn}
        clearAllCells={clearAllCells}

          grid={grid}
          tempo={tempo}
          sampleNames={sampleNames}
      />
      
      {/* Category selection tabs */}
      <CategoryTabs
        categories={instrumentCategories}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
      />

      {/* Grid with instrument rows */}
      <div className="audio-grid">
        {organizedInstruments.map((name) => {
          const originalIndex = sampleNames.indexOf(name);
          
          // Skip if sample not found
          if (originalIndex < 0 || !grid[originalIndex]) {
            console.warn(`Sample "${name}" not found in sampleNames or grid`);
            return null;
          }

          return (
            <GridRow
              key={originalIndex}
              name={name}
              rowData={grid[originalIndex]}
              currentColumn={currentColumn}
              onToggleCell={(colIndex) => toggleCell(originalIndex, colIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioGrid;