import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import healthcheckRouter from './routes/healthcheck.routes.js'

app.use('/api/v1/healthcheck', healthcheckRouter)

export default app;
