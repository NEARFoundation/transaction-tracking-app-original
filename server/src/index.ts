import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { addDefaultTypesTx } from './helpers/addDefaultTypesTx.js';
import { SyncedCron } from './helpers/syncedCron.js';
import { routes } from './routes/collector.routes.js';

const mongoConnectionString = process.env.MONGO ?? '';
const port = process.env.PORT;

await mongoose.connect(mongoConnectionString);
const app = express();
app.use(cors());
app.use(express.json());

routes(app);
app.listen(port);

await addDefaultTypesTx();
SyncedCron.start();
