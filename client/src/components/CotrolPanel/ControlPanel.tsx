import React from "react";
import PlaybackControls from "./PlaybackControls/PlaybackControls";
import LoopControl from "./LoopControl/LoopControl";
import VolumeControl from "./VolumeControl/VolumeControl";
import SpeedControl from "./SpeedControl/SpeedControl";
import GridSizeControl from "./GridSizeControl/GridSizeControl";
import ExportControls from "./ExportControls/ExportControls";
import "./ControlPanel.css";

type ControlPanelProps = {
  isPlaying: boolean;
  looping: boolean;
  volume: number;
  playbackRate: number;
  canAddColumn: boolean;
  canRemoveColumn: boolean;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  toggleLoop: () => void;
  increaseVolume: () => void;
  decreaseVolume: () => void;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  clearAllCells: () => void;
  grid: boolean[][];
  tempo: number;
  sampleNames: string[];
};

const ControlPanel: React.FC<ControlPanelProps> = (props) => (
  <div className="audio-grid-controls">
    <PlaybackControls
      isPlaying={props.isPlaying}
      start={props.start}
      pause={props.pause}
      stop={props.stop}
      reset={props.reset}
      clearAllCells={props.clearAllCells}
    />

    <LoopControl looping={props.looping} toggleLoop={props.toggleLoop} />

    <VolumeControl
      volume={props.volume}
      increaseVolume={props.increaseVolume}
      decreaseVolume={props.decreaseVolume}
    />

    <SpeedControl
      playbackRate={props.playbackRate}
      increaseSpeed={props.increaseSpeed}
      decreaseSpeed={props.decreaseSpeed}
    />

    <GridSizeControl
      onAddColumn={props.onAddColumn}
      onRemoveColumn={props.onRemoveColumn}
      canAddColumn={props.canAddColumn}
      canRemoveColumn={props.canRemoveColumn}
    />
    {/* <ExportControls
      grid={props.grid}
      tempo={props.tempo}
      sampleNames={props.sampleNames}
    /> */}
  </div>
);

export default ControlPanel;
