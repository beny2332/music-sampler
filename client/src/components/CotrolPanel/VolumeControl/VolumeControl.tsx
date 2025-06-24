import React from "react";

type VolumeControlProps = {
  volume: number;
  increaseVolume: () => void;
  decreaseVolume: () => void;
};

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume, increaseVolume, decreaseVolume
}) => (
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
);

export default VolumeControl;