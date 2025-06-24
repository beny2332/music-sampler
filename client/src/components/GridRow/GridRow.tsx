import React from "react";
import GridCell from "../GridCell/GridCell";
import { formatSampleName } from "../../utils/formatSampleName";
import "./GridRow.css";

type GridRowProps = {
  name: string;
  rowData: boolean[];
  currentColumn: number;
  onToggleCell: (colIndex: number) => void;
};

const GridRow: React.FC<GridRowProps> = ({ 
  name, rowData, currentColumn, onToggleCell 
}) => (
  <div className="audio-grid-row">
    <div className="audio-grid-sample-name">
      {formatSampleName(name)}
    </div>
    <div className="audio-grid-cells">
      {rowData.map((cell, colIndex) => (
        <GridCell
          key={colIndex}
          active={cell}
          isCurrent={colIndex === currentColumn}
          onClick={() => onToggleCell(colIndex)}
        />
      ))}
    </div>
  </div>
);

export default GridRow;