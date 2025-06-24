export function generateMidiFile(
  grid: boolean[][],
  tempo: number,
  sampleNames: string[]
): Uint8Array {
  // MIDI constants
  const HEADER_CHUNK_ID = [0x4D, 0x54, 0x68, 0x64]; // "MThd"
  const HEADER_CHUNK_SIZE = [0x00, 0x00, 0x00, 0x06]; // Header size (always 6)
  const FORMAT_TYPE = [0x00, 0x01]; // Format 1 - multiple tracks
  const NUM_TRACKS = [0x00, 0x02]; // One track for tempo, one for notes
  const TIME_DIVISION = [0x00, 0x60]; // 96 ticks per quarter note
  
  const TRACK_CHUNK_ID = [0x4D, 0x54, 0x72, 0x6B]; // "MTrk"
  
  // Create header
  const header = [
    ...HEADER_CHUNK_ID,
    ...HEADER_CHUNK_SIZE,
    ...FORMAT_TYPE,
    ...NUM_TRACKS, 
    ...TIME_DIVISION
  ];
  
  // Create tempo track
  const tempoValue = Math.floor(60000000 / tempo); // Convert BPM to microseconds per quarter note
  const tempoBytes = [
    (tempoValue >> 16) & 0xFF,
    (tempoValue >> 8) & 0xFF,
    tempoValue & 0xFF
  ];
  
  const tempoTrack = [
    ...TRACK_CHUNK_ID,
    0x00, 0x00, 0x00, 0x0B, // Track length (11 bytes)
    0x00, 0xFF, 0x51, 0x03, // Delta time, meta event, tempo, length
    ...tempoBytes,
    0x00, 0xFF, 0x2F, 0x00  // End of track
  ];
  
  // Generate note data from grid
  const noteEvents = [];
  const TICKS_PER_STEP = 24; // 16th note (96/4)
  
  // Map samples to General MIDI drum notes (35-81)
  // Using standard GM drum mapping
  const sampleToMidiMap = sampleNames.map((name, i) => {
    // Basic mapping for common drum names
    if (name.toLowerCase().includes('kick')) return 36;  // Bass Drum
    if (name.toLowerCase().includes('snare')) return 38; // Snare Drum
    if (name.toLowerCase().includes('hihat') || name.toLowerCase().includes('hat')) {
      if (name.toLowerCase().includes('open')) return 46; // Open Hi-hat
      return 42; // Closed Hi-hat
    }
    if (name.toLowerCase().includes('tom')) return 45 + (i % 4); // Toms
    if (name.toLowerCase().includes('crash')) return 49; // Crash
    if (name.toLowerCase().includes('ride')) return 51;  // Ride
    if (name.toLowerCase().includes('clap')) return 39;  // Hand Clap
    
    // For other samples, distribute across remaining drum notes
    return 35 + (i % 46); // Use range 35-81 (General MIDI drum range)
  });
  
  // Convert grid to MIDI note events
  for (let col = 0; col < grid[0].length; col++) {
    for (let row = 0; row < grid.length; row++) {
      if (grid[row][col]) {
        // Note On event
        noteEvents.push({
          deltaTime: col * TICKS_PER_STEP,
          type: 0x99, // Note on, channel 10 (drums)
          note: sampleToMidiMap[row],
          velocity: 100
        });
        
        // Note Off event (1 step later)
        noteEvents.push({
          deltaTime: col * TICKS_PER_STEP + 1,
          type: 0x89, // Note off, channel 10
          note: sampleToMidiMap[row],
          velocity: 0
        });
      }
    }
  }
  
  // Sort by time
  noteEvents.sort((a, b) => a.deltaTime - b.deltaTime);
  
  // Convert absolute times to delta times
  let lastTime = 0;
  for (let i = 0; i < noteEvents.length; i++) {
    const absTime = noteEvents[i].deltaTime;
    noteEvents[i].deltaTime = absTime - lastTime;
    lastTime = absTime;
  }
  
  // Build note track
  let noteTrackData = [];
  for (const event of noteEvents) {
    // Variable-length encoding of delta time
    let deltaBytes = [];
    let deltaTime = event.deltaTime;
    
    if (deltaTime === 0) {
      deltaBytes.push(0);
    } else {
      while (deltaTime > 0) {
        let byte = deltaTime & 0x7F;
        deltaTime = deltaTime >> 7;
        if (deltaBytes.length > 0) byte |= 0x80;
        deltaBytes.unshift(byte);
      }
      if (deltaBytes.length === 0) deltaBytes.push(0);
    }
    
    noteTrackData.push(...deltaBytes);
    noteTrackData.push(event.type);
    noteTrackData.push(event.note);
    noteTrackData.push(event.velocity);
  }
  
  // Add end of track
  noteTrackData.push(0x00); // Delta time
  noteTrackData.push(0xFF); // Meta event
  noteTrackData.push(0x2F); // End of track
  noteTrackData.push(0x00); // Length
  
  // Track header with length
  const noteTrack = [
    ...TRACK_CHUNK_ID,
    // Track length (4 bytes)
    (noteTrackData.length >> 24) & 0xFF,
    (noteTrackData.length >> 16) & 0xFF,
    (noteTrackData.length >> 8) & 0xFF,
    noteTrackData.length & 0xFF,
    ...noteTrackData
  ];
  
  // Combine all parts
  const midiData = new Uint8Array([
    ...header,
    ...tempoTrack,
    ...noteTrack
  ]);
  
  return midiData;
}

// Helper function to create download link
export function downloadMidi(midiData: Uint8Array, filename: string = 'my-beat'): void {
  const blob = new Blob([midiData], {type: 'audio/midi'});
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${filename}.mid`;
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}