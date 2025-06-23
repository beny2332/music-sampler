export async function loadAudioBuffers(
  audioCtx: AudioContext,
  sampleNames: string[],
  sampleMap: Record<string, string>,
  baseUrl: string
): Promise<AudioBuffer[]> {
  const loadSample = async (url: string) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioCtx.decodeAudioData(arrayBuffer);
  };
  return Promise.all(
    sampleNames.map((name) => loadSample(`${baseUrl}/${sampleMap[name]}`))
  );
}