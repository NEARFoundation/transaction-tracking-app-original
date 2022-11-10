import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { logger } from '../../shared/helpers/logging.js';

import { addDefaultTypesTx } from './helpers/addDefaultTypesTx.js';
import { MONGO_CONNECTION_STRING, PORT } from './helpers/config.js';
import { SyncedCron } from './helpers/syncedCron.js';
import { runAllNonRunningTasks } from './helpers/updateTransactions.js';
import { routes } from './routes/collector.routes.js';

await mongoose.connect(MONGO_CONNECTION_STRING);
const app = express();
app.use(cors());
app.use(express.json());

routes(app);
app.listen(PORT);

await addDefaultTypesTx();

// logger.debug('Awaiting runAllNonRunningTasks().');
await runAllNonRunningTasks(); // Call once before cron job even starts.

SyncedCron.start();
