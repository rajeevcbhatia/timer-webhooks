import express from 'express';
import { DatabaseInitializer } from './db/DatabaseInitializer';

const app = express();
const port = 8081;

DatabaseInitializer.initialize();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
