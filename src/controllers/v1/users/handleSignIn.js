import { z } from 'zod'

import User from '../../../models/User.js'
import digestPasswordString from '../../../services/digestPasswordString.js'
import { createToken } from '../../../services/jwtSession.js'

const ParamsSchema = z.object(
  {
    email: z.email('invalid'),
    password: z.string('required').trim().min(1, 'invalid')
  },
  'params required'
)

export default async (req, res) => {
  const { email, password } = await ParamsSchema.parseAsync(req.body)
  const user = await User.findOne({ email, status: 'active' }).exec()

  if (!user) {
    res.status(422).json({ messages: ['credentials invalid'] })
    return
  }

  const digest = digestPasswordString(password, user.salt)[0]
  if (digest != user.passwordDigest) {
    res.status(422).json({ messages: ['credentials invalid'] })
    return
  }

  const token = createToken(user)
  res.status(200).json({ authToken: token })
}
