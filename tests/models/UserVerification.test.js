import { randomUUID } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import mongoose from 'mongoose'

import UserVerification from '../../src/models/UserVerification.js'

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
  test('does not throw an error', () => {
    expect(() => new UserVerification({})).not.toThrow()
  })
})

describe('Saving while empty', () => {
  test('throws validation error', async () => {
    const verification = new UserVerification({})

    try {
      await verification.save()
      throw new Error('Expected save to fail validation')
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(Object.keys(err.errors).sort()).toEqual(['code', 'email', 'uuid'])
    }
  })
})

describe('Generating a verification code', () => {
  test('sets a six-digit code, expiration, and UUID', () => {
    const verification = new UserVerification()

    verification.generateCode()

    expect(verification.code).toMatch(/^\d{6}$/)
    expect(verification.uuid.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })
})

describe('Save with minimum attributes', () => {
  test('does not throw an error', async () => {
    const verification = new UserVerification({
      uuid: randomUUID(),
      email: 'verification@example.com',
      code: '123456'
    })

    await verification.save()
  })
})
