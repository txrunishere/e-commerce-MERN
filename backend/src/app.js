import express from "express";
import cookieParser from 'cookie-parser'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

import healthcheckRouter from './routes/healthcheck.routes.js'
import userRouter from './routes/user.routes.js'

app.use('/api/v1/healthcheck', healthcheckRouter)
app.use('/api/v1/user', userRouter)

export default app;
