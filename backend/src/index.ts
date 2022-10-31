import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { logger } from '../../shared/helpers/logging.js';

import { addDefaultTypesTx } from './helpers/addDefaultTypesTx.js';
import { mongoConnectionString, port } from './helpers/config.js';
import { SyncedCron } from './helpers/syncedCron.js';
import { runAllNonRunningTasks } from './helpers/updateTransactions.js';
import { routes } from './routes/collector.routes.js';

await mongoose.connect(mongoConnectionString);
const app = express();
app.use(cors());
app.use(express.json());

routes(app);
app.listen(port);

await addDefaultTypesTx();

logger.debug('Awaiting runAllNonRunningTasks().');
await runAllNonRunningTasks(); // Call once before cron job even starts.

SyncedCron.start();
