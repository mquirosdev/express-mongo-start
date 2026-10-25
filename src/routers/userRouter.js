import express from "express";

import bodyParserMiddleware from '../middleware/bodyParserMiddleware.js';
import handleCreate from '../controllers/users/handleCreate.js';
import handleConfirm from "../controllers/users/handleConfirm.js";
import handleGenerateVerification from '../controllers/users/handleGenerateVerification.js'

const userRouter = express.Router();

userRouter.post("/", 
  bodyParserMiddleware.none(),
  handleCreate
)

userRouter.put("/verification/confirm",
  bodyParserMiddleware.none(),
  handleConfirm
)

userRouter.post("/verification",
  bodyParserMiddleware.none(),
  handleGenerateVerification
)

export default userRouter;