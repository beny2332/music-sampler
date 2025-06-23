import AudioGrid from "./components/AudioGrid";

function App() {
  return (
    <div>
      <h1>🎵 Music Sampler</h1>
      <AudioGrid columns={16} tempo={100} />
    </div>
  );
}

export default App;
