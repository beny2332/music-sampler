import express from 'express';

const app = express();
const PORT = 3001;

app.get('/ping', (_, res) => {
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
