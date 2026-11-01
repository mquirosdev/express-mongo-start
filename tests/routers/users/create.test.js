import { MongoMemoryServer } from 'mongodb-memory-server'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

import app from '../../../src/app.js'
import User from '../../../src/models/User.js'
import presentUser from '../../../src/presenters/presentUser.js'

let mongoServer

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterEach(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

class InvalidRequestBody {
  constructor(email, password) {
    this.email = email
    this.password = password
  }

  toString() {
    return `email: "${this.email}" password: "${this.password}"`
  }
}

describe('POST /api/v1/users', () => {
  const invalidRequestBodies = [
    null,
    {},
    new InvalidRequestBody('', ''),
    new InvalidRequestBody('invalid@example', '123'), // Invalid params
    new InvalidRequestBody('invalid@example.com', '123'),
    new InvalidRequestBody('invalid@example', 'P@ssw0rd123')
  ]

  const invalidRequestMessages = [
    [' params required'],
    ['email invalid', 'password required'],
    ['email invalid', 'password invalid'],
    ['email invalid', 'password invalid'],
    ['password invalid'],
    ['email invalid']
  ]

  invalidRequestBodies.forEach((body, idx) => {
    describe(`invalid params - ${invalidRequestBodies[idx]}`, () => {
      test('response status 422', async () => {
        const response = await request(app)
          .post('/api/v1/users')
          .set('Accept', 'application/json')
          .send(body)

        expect(response.status).toBe(422)
        invalidRequestMessages[idx].forEach((msg) => {
          expect(response.body.messages).toContain(msg)
        })
      })
    })
  })

  describe('with valid parameters and email taken', () => {
    test('response status 422', async () => {
      const email = 'valid@example.com'
      const password = 'P@ssw0rd123'

      const user = new User({ email, password })
      await user.save()

      const response = await request(app)
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send({ email, password })

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ messages: ['email taken'] })
    })
  })

  describe('with valid parameters and email not taken', () => {
    test('respose status 201', async () => {
      const email = 'valid@example.com'
      const password = 'P@ssw0rd123'

      const response = await request(app)
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send({ email, password, name: { first: 'first', last: 'last' } })

      expect(response.status).toBe(201)

      const user = await User.findOne({ email }).exec()
      const responseBody = presentUser(user)

      ;['name', 'email', 'status'].forEach((k) => {
        expect(response.body[k]).toEqual(responseBody[k])
      })
    })
  })
})
