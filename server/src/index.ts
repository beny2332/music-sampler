import express from "express";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors())
const PORT = 3001;

// Serve static files from public/samples
app.use("/samples", express.static(path.join(__dirname, "../public/samples")));

// Sample mapping endpoint
app.get("/api/samples", (_: any, res: any) => {
  res.json({
    clap: "clap-808.wav",
    cowbell: "cowbell-808.wav",
    crash: "crash-tape.wav",
    hihat: "hihat-acoustic02.wav",
    kick: "kick-classic.wav",
    openhat: "openhat-808.wav",
    openhat_acoustic: "openhat-acoustic01.wav",
    perc_hollow: "perc-hollow.wav",
    perc_tribal: "perc-tribal.wav",
    ride: "ride-acoustic01.wav",
    shaker: "shaker-shuffle.wav",
    snare: "snare-808.wav",
    tom_analog: "tom-analog.wav",
    tom_rototom: "tom-rototom.wav"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
