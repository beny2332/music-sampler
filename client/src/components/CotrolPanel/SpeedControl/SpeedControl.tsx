import React from "react";

type SpeedControlProps = {
  playbackRate: number;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
};

const SpeedControl: React.FC<SpeedControlProps> = ({
  playbackRate, increaseSpeed, decreaseSpeed
}) => (
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
);

export default SpeedControl;