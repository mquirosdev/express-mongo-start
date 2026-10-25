import { z } from "zod";

import User from '../../models/User.js';
import UserPresenter from "../../presenters/UserPresenter.js";

const ParamsSchema = z.object({
  name: z.object({
    first: z.string().trim().optional(),
    last: z.string().trim().optional(),
  }).optional(),
  email: z.email("invalid").refine(async (email) => {
    const existingUser = await User.findOne({ email: email }).exec();
    return !existingUser
  }, { message: "taken" }),
  password: z.string("required").trim().min(10, { error: "invalid" }),
}, "params required")

export default async (req, res) => {
  let params = await ParamsSchema.parseAsync(req.body);
  params = Object.assign(params, { status: "new" });

  const user = new User(params);
  await user.save();

  res.status(201).json(new UserPresenter(user).values);
}