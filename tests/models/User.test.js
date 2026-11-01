import { MongoMemoryServer } from 'mongodb-memory-server'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import mongoose from 'mongoose'

import User from '../../src/models/User.js'
import digestPasswordString from '../../src/services/digestPasswordString.js'

let mongoServer

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterEach(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('Empty instantiation', () => {
  test('does not throw an error', async () => {
    expect(() => new User({})).not.toThrow()
  })
})

describe('Saving while empty', () => {
  test('Throws validation error', async () => {
    const user = new User({})
    try {
      await user.save()
    } catch (err) {
      expect(err instanceof mongoose.Error.ValidationError).toBeTruthy()
      const requiredAttributes = Object.keys(err.errors)
      expect(requiredAttributes).toEqual(['salt', 'passwordDigest', 'email'])
    }
  })
})

describe('Setting plain password', () => {
  test('generates salt and digest', async () => {
    const password = 'pwdtest'
    const { passwordDigest, salt } = new User({ password: password })
    const expectedDigest = digestPasswordString(password, salt)[0]
    expect(expectedDigest).toEqual(passwordDigest)
  })
})

describe('Save with minimun attributes', () => {
  test('does not throw error', async () => {
    const user = new User({ email: 'test@example.com', password: 'test' })
    await user.save()
  })
})
