import { z } from 'zod'

import User from '../../../models/User.js'
import UserVerification from '../../../models/UserVerification.js'
import sendVerification from '../../../mailers/user/sendVerification.js'

const ParamsSchema = z.object(
  {
    email: z.email('invalid')
  },
  'params required'
)

export default async (req, res) => {
  const { email } = await ParamsSchema.parseAsync(req.body)
  await User.findOne({ email, status: 'new' }).orFail()

  let verification = await UserVerification.findOne({ email }).exec()
  if (!verification) {
    verification = new UserVerification({ email })
  }

  verification.generateCode()
  await verification.save()

  await sendVerification({
    email: verification.email,
    code: verification.code,
    uuid: verification.uuid
  })

  res.status(204).send()
}
