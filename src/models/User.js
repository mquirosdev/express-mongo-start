import { Schema, model } from 'mongoose'

import digestPasswordString from '../services/digestPasswordString.js'
import { UserStatuses } from '../constants.js'

const schema = new Schema(
  {
    name: {
      first: { type: String, trim: true },
      last: { type: String, trim: true }
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    status: {
      type: String,
      required: true,
      enum: UserStatuses,
      default: 'new'
    },
    passwordDigest: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

schema.virtual('password').set(function (v) {
  const [passwordDigest, salt] = digestPasswordString(v)
  this.passwordDigest = passwordDigest
  this.salt = salt
})

export default model('users', schema)
