import jwt from "jsonwebtoken";

import { verifyToken } from "../services/jwtSession.js";
import User from "../models/User.js";

export default async (req, res, next) => {
  const authorization = req.headers.authorization || "Bearer ";
  if(authorization.split(' ')[0] !== "Bearer") { throw new jwt.JsonWebTokenError("Invalid token") }

  const token = authorization.split(' ')[1];
  const payload = verifyToken(token);

  const user = await User.findOne({ _id: payload.sub, status: "active" }).exec();
  if(!user) { throw new jwt.JsonWebTokenError("Invalid token") }

  req.currentUser = user;
  next();
};