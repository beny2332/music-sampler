import React from "react";
import "./LoopControl.css";
import "../BaseControls.css";

type LoopControlProps = {
  looping: boolean;
  toggleLoop: () => void;
};

const LoopControl: React.FC<LoopControlProps> = ({ looping, toggleLoop }) => (
  <div className="control-group">
    <button 
      onClick={toggleLoop} 
      className={`control-button ${looping ? 'active' : ''}`}
      title={looping ? "Disable Loop" : "Enable Loop"}
    >
      {looping ? "🔄" : "↩️"}
    </button>
  </div>
);

export default LoopControl;