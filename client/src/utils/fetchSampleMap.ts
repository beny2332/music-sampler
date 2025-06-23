export async function fetchSampleMap(apiUrl: string) {
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Failed to fetch samples");
  return res.json();
}