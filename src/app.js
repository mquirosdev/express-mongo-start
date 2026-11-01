import express from "express";
import mongoose from "mongoose";
import { MulterError } from "multer";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

import userRouter from "./routers/userRouter.js";
import appRouter from "./routers/appRouter.js";

const app = express();

app.use(express.json());
  
app.use('/api/v1/users', userRouter);
app.use('/api/v1', appRouter);

// This catches errors when validating if attached files are valid
app.use((err, _req, res, next) => {
  if(err instanceof MulterError) {
    res.status(400).json({ status: "error", msg: err.message });
  } else {
    next(err)
  }
});

app.use((err, _req, res) => {
  if(err instanceof ZodError) {
    res.status(422).json({
      messages: err.issues.map(i => `${i.path.join('.')} ${i.message}`)
    });
  } else if(err instanceof mongoose.Error.DocumentNotFoundError) {
    res.status(404).json({ messages: ["Record not found"] });
  } else if(err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    res.status(401).json({ messages: ["invalid token"] });
  } else {
    const status = err.status || 500;
    const error = ['development', 'test'].includes(process.env.NODE_ENV) ? err.message : "Something went wrong";
    res.status(status).json({ messages: [error] });
  }
});

export default app;