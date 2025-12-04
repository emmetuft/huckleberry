import express from 'express';
import ViteExpress from 'vite-express';
import getPort from 'get-port';
import setupProxy from './setupProxy.js';
import { setupServer } from './server/index.js';

const app = express();
const port = await getPort({ port: [3000, 3001, 3002] });

// Setup backend API routes and services
await setupServer(app);

// Setup Domo proxy (must come after API routes)
app.use(setupProxy);

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
);
