import React from 'react';
import { generateMidiFile, downloadMidi } from '../../../utils/midiExport';
import './ExportControls.css';
import '../BaseControls.css';

type ExportControlsProps = {
  grid: boolean[][];
  tempo: number;
  sampleNames: string[];
}

const ExportControls: React.FC<ExportControlsProps> = ({ grid, tempo, sampleNames }) => {
  const handleExportMidi = () => {
    const midiData = generateMidiFile(grid, tempo, sampleNames);
    downloadMidi(midiData, 'drum-pattern');
  };
  
  return (
    <div className="control-group export-controls">
      <button
        onClick={handleExportMidi}
        className="control-button export"
        title="Export as MIDI file"
      >
        💾 Export MIDI
      </button>
    </div>
  );
};

export default ExportControls;