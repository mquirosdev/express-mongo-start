import { smtpSender } from '../../constants.js'
import useSend from '../useSend.js'

export default async (verification) => {
  const send = await useSend()
  send({
    from: smtpSender,
    to: verification.email,
    subject: 'Verification Code',
    html: `Code: ${verification.code}, Uuid: ${verification.uuid}`
  })
}
