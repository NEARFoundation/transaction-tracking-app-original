import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO);

const app = express();
app.use(cors());
app.listen(process.env.PORT);
