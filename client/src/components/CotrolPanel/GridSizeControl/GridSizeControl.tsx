import React from "react";
import "./GridSizeControl.css";
import "../BaseControls.css";

type GridSizeControlProps = {
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  canAddColumn: boolean;
  canRemoveColumn: boolean;
};

const GridSizeControl: React.FC<GridSizeControlProps> = ({
  onAddColumn, onRemoveColumn, canAddColumn, canRemoveColumn
}) => (
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
);

export default GridSizeControl;