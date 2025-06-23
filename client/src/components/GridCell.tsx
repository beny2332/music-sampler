import React, { memo } from "react";
import "./GridCell.css";

type GridCellProps = {
  active: boolean;
  isCurrent: boolean;
  onClick: () => void;
};

const GridCell: React.FC<GridCellProps> = memo(({ active, isCurrent, onClick }) => {
  let className = "grid-cell";
  if (active) className += " active";
  if (isCurrent) className += " current";

  return <div className={className} onClick={onClick} />;
});

export default GridCell;