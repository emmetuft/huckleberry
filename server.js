import express from 'express';
import ViteExpress from 'vite-express';
import getPort from 'get-port';

const app = express();
const port = await getPort({ port: [3000, 3001, 3002] });

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
);
