import express from "express";
import path from "path";
import cors from "cors";
import samplesRouter from "./routes/samples";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// Serve static files from public/samples
app.use("/samples", express.static(path.join(__dirname, "../public/samples")));

// API routes
app.use("/api", samplesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});