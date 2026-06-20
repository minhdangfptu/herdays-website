/**
 * Anh em Twobars: Giang Dam, Louis, Antonie was here
 * All our efforts are for a brighter future, where we can freely eat bread and drink bubble tea without worrying about someone stealing it.
 * Updated by Louis on 2026-06-16
 */
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';

import env from './config/environment.js';
import connectDB from './config/mongodb.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import router from './routes/index.js';

const app = express();

const corsOptions = {
  origin: [
    env.frontendUrl
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan('dev'));

connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/herdays-api', router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`Server is running at http://localhost:${env.port}`);
});
