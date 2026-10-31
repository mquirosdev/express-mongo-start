import express from "express";

import parseMultipartBody from '../middleware/parseMultipartBody.js';
import handleCreate from '../controllers/users/handleCreate.js';
import handleConfirm from "../controllers/users/handleConfirm.js";
import handleGenerateVerification from '../controllers/users/handleGenerateVerification.js';
import handleSignIn from '../controllers/users/handleSignIn.js'

const userRouter = express.Router();

userRouter.post("/", 
  parseMultipartBody.none(),
  handleCreate
);

userRouter.put("/verification/confirm",
  parseMultipartBody.none(),
  handleConfirm
);

userRouter.post("/verification",
  parseMultipartBody.none(),
  handleGenerateVerification
);

userRouter.post("/signin", 
  parseMultipartBody.none(),
  handleSignIn
);

export default userRouter;