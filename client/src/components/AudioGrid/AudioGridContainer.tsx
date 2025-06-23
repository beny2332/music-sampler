import React, { useState } from "react";
import AudioGrid from "./AudioGrid";

const DEFAULT_COLUMNS = 8;
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 32;

const AudioGridContainer: React.FC = () => {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  return (
    <div className="p-4">
      <AudioGrid
        columns={columns}
        tempo={120}
        onAddColumn={() => setColumns((c) => Math.min(MAX_COLUMNS, c + 1))}
        onRemoveColumn={() => setColumns((c) => Math.max(MIN_COLUMNS, c - 1))}
        canAddColumn={columns < MAX_COLUMNS}
        canRemoveColumn={columns > MIN_COLUMNS}
      />
    </div>
  );
};

export default AudioGridContainer;