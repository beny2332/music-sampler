import { useEffect, useState } from "react";
import { fetchSampleMap } from "../utils/fetchSampleMap";

export function useSampleMap(apiUrl: string, columns: number) {
  const [sampleMap, setSampleMap] = useState<Record<string, string>>({});
  const [sampleNames, setSampleNames] = useState<string[]>([]);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSampleMap(apiUrl)
      .then((data) => {
        setSampleMap(data);
        const names = Object.keys(data);
        setSampleNames(names);
        setGrid(Array.from({ length: names.length }, () => Array(columns).fill(false)));
      })
      .catch((err) => {
        setError("Failed to fetch samples");
        console.error(err);
      });
  }, [apiUrl, columns]);

  return { sampleMap, sampleNames, grid, setGrid, error };
}