export enum AudioErrorType {
  CONTEXT_CREATION = 'context_creation',
  BUFFER_DECODE = 'buffer_decode',
  SAMPLE_LOAD = 'sample_load',
  PLAYBACK = 'playback',
}

export interface AudioError {
  type: AudioErrorType;
  message: string;
  originalError?: Error;
  recoverable: boolean;
}


export function createAudioError(
  type: AudioErrorType, 
  message: string, 
  originalError?: Error,
  recoverable: boolean = true
): AudioError {
  return { type, message, originalError, recoverable };
}