import { z } from "zod";
import { addMinutes } from "date-fns";

import useTransaction from "../../models/useTransaction.js";
import UserVerification from "../../models/UserVerification.js";
import User from "../../models/User.js";


const ParamsSchema = z.object({
  uuid: z.string("required").trim().min(1, "invalid"),
  code: z.string("required").trim().min(6, "invalid")
}, "params required");

export default async (req, res) => {
  const { uuid, code } = await ParamsSchema.parseAsync(req.body);
  const transaction = useTransaction();
  await transaction(async () => { 
    const verification = await UserVerification.findOne({
      uuid,
      code,
      expiresAt: { "$gt": new Date() }
    }).orFail();

    verification.expiresAt = addMinutes(new Date(), - 10);
    await verification.save();

    const user =  await User.findOne({ email: verification.email, status: "new" }).orFail();
    user.status = "active";
    await user.save();
  });
  
  res.status(204).send();
}