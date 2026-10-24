import { z } from "zod";

import User from '../../models/User.js';
import UserVerification from '../../models/UserVerification.js';

const ParamsSchema = z.object({
  email: z.email("invalid")
}, "params required");

export default async (req, res) => {
  const { email } = await ParamsSchema.parseAsync(req.body);
  const user = await User.findOne({ email, status: "new" }).orFail();
  
  let verification = await UserVerification.findOne({ email }).exec();
  if(!verification) { verification = new UserVerification({ email }); }
  
  verification.generateCode();
  await verification.save();

  res.status(204).send();
}