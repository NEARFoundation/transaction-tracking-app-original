import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import {routes} from './routes/collector.routes.js';
import {SyncedCron} from "./helpers/syncedCron.js";
import {addDefaultTypesTx} from "./helpers/addDefaultTypesTx.js";

await mongoose.connect(process.env.MONGO);
const app = express();
app.use(cors());
app.use(express.json())

routes(app);
app.listen(process.env.PORT);

await addDefaultTypesTx();
SyncedCron.start();


