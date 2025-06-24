export function createGrid(rows: number, columns: number): boolean[][] {
  return Array(rows)
    .fill(0)
    .map(() => Array(columns).fill(false));
}

export function resizeGrid(grid: boolean[][], newColumns: number): boolean[][] {
  return grid.map((row) => {
    const newRow = Array(newColumns).fill(false);
    for (let i = 0; i < Math.min(row.length, newColumns); i++) {
      newRow[i] = row[i];
    }
    return newRow;
  });
}

export function toggleGridCell(
  grid: boolean[][],
  rowIndex: number,
  colIndex: number
): boolean[][] {
  if (
    rowIndex < 0 ||
    rowIndex >= grid.length ||
    colIndex < 0 ||
    colIndex >= grid[0].length
  ) {
    return grid;
  }

  const newGrid = [...grid];
  newGrid[rowIndex] = [...newGrid[rowIndex]];
  newGrid[rowIndex][colIndex] = !newGrid[rowIndex][colIndex];

  return newGrid;
}

interface GridData {
  grid: boolean[][];
  tempo: number;
  columns: number;
}

export function saveGridState(
  grid: boolean[][],
  tempo: number,
  columns: number,
  name: string = "default"
): void {
  try {
    const data: GridData = { grid, tempo, columns };
    localStorage.setItem(`beatMaker_${name}`, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save grid state:", error);
  }
}

export function loadGridState(name: string = "default"): GridData | null {
  try {
    const savedData = localStorage.getItem(`beatMaker_${name}`);
    if (!savedData) return null;

    return JSON.parse(savedData) as GridData;
  } catch (error) {
    console.error("Failed to load grid state:", error);
    return null;
  }
}
