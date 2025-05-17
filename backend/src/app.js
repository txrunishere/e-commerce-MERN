import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import healthcheckRouter from './routes/healthcheck.routes.js'
import userRouter from './routes/user.routes.js'

app.use('/api/v1/healthcheck', healthcheckRouter)
app.use('/api/v1/user', userRouter)

export default app;
