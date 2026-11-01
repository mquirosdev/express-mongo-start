import { MongoMemoryServer } from 'mongodb-memory-server'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { ZodError } from 'zod'
import mongoose from 'mongoose'

import User from '../../../src/models/User'
import handleSignIn from '../../../src/controllers/v1/users/handleSignIn'

let mongoServer

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterEach(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

vi.mock('../../../src/services/jwtSession', () => ({
  createToken: vi.fn().mockReturnValue('test.test.test')
}))

describe('handleSignIn', () => {
  let res

  beforeEach(() => {
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }
  })

  const invalidParametersPaths = [
    [],
    ['email', 'password'],
    ['email', 'password'],
    ['password'],
    ['email']
  ]

  describe('when invalid parameters', () => {
    ;[
      null,
      {},
      { email: '   ', password: '  ' },
      { email: 'test@valid.com', password: '' },
      { email: '', password: 'P@ssw0rd' }
    ].forEach((body, idx) => {
      test(`raises ZodError ${idx}`, async () => {
        let err
        try {
          await handleSignIn({ body }, res)
        } catch (e) {
          err = e
        }
        expect(err instanceof ZodError).toBeTruthy()

        const issues = err.issues.map((i) => i.path.join('.'))
        invalidParametersPaths[idx].forEach((path) => {
          expect(issues).toContain(path)
        })
      })
    })
  })

  describe('when valid parameters', () => {
    const email = 'valid@example.com'
    const password = 'P@ssw0rd'
    const body = { email, password }

    const createUser = async (email, password, status) => {
      const user = new User({ email, password, status })
      await user.save()
    }

    describe('when email does not have corresponding user', () => {
      test('return status 422', async () => {
        await createUser('valid2@example.com', password, 'active')
        await handleSignIn({ body }, res)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(422)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
          messages: ['credentials invalid']
        })
      })
    })

    describe('when email correspond to non active user', () => {
      test('return status 422', async () => {
        // Creates user that has been not confirmed
        await createUser(email, password, 'new')
        await handleSignIn({ body }, res)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(422)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
          messages: ['credentials invalid']
        })
      })
    })

    describe('when email corresponds to active user but password incorrect', () => {
      test('return status 422', async () => {
        await createUser(email, '0therp@ssw0rd', 'active')
        await handleSignIn({ body }, res)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(422)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
          messages: ['credentials invalid']
        })
      })
    })

    describe('when email corresponds to active user and correct password', () => {
      test('return status 200', async () => {
        await createUser(email, password, 'active')
        await handleSignIn({ body }, res)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
          authToken: 'test.test.test'
        })
      })
    })
  })
})
