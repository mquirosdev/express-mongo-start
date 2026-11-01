import crypto from 'node:crypto'
import { addMinutes } from 'date-fns'
import { Schema, model } from 'mongoose'

const VerificationCodeMinutesTTL = 5
const UserVerificationSchema = Schema(
  {
    uuid: {
      type: Schema.Types.UUID,
      required: true,
      index: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    code: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    methods: {
      generateCode: function () {
        this.code = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
        this.expiresAt = addMinutes(new Date(), VerificationCodeMinutesTTL)
        this.uuid = crypto.randomUUID()
      }
    }
  }
)

export default model('user_verifications', UserVerificationSchema)
