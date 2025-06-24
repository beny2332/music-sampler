export function calculateBeatDuration(tempo: number, playbackRate: number = 1.0): number {
  return (60000 / tempo) / (2 * playbackRate);
}

export function calculateGainValue(volume: number): number {
  return Math.pow(volume, 2);
}

interface AudioSourceOptions {
  playbackRate?: number;
  detune?: number;
  gain?: number;
}

export function createAudioSource(
  context: AudioContext,
  buffer: AudioBuffer,
  destination: AudioNode,
  options: AudioSourceOptions = {}
): AudioBufferSourceNode {
  const source = context.createBufferSource();
  source.buffer = buffer;
  
  // Apply options
  if (options.playbackRate) source.playbackRate.value = options.playbackRate;
  if (options.detune) source.detune.value = options.detune;
  
  // Apply gain if needed
  if (options.gain !== undefined && options.gain !== 1) {
    const gainNode = context.createGain();
    gainNode.gain.value = options.gain;
    source.connect(gainNode);
    gainNode.connect(destination);
  } else {
    source.connect(destination);
  }
  
  return source;
}