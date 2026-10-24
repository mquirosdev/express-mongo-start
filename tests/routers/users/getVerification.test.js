import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';

import app from "../../../src/app.js";
import User from '../../../src/models/User.js';
import UserVerification from '../../../src/models/UserVerification.js';

describe("POST /users/verification", () => {
  describe("without parameters", () => {
    test("reponse status 422", async () => {
      const response = await request(app)
        .post('/users/verification')
        .set('Accept', 'application/json')

      expect(response.status).toBe(422);
      expect(response.body.messages).toEqual([' params required']);
    });
  });

  ["", "     ", "invalid@example"].forEach(email => {
    describe(`with email = "${email}"`, () => {
      test("reponse status 422", async () => {
        const response = await request(app)
          .post('/users/verification')
          .set('Accept', 'application/json')
          .send({ email })

        expect(response.status).toBe(422);
        expect(response.body.messages).toEqual(['email invalid']);
      });
    });
  });

  describe("with valid email", () => {
    const email = "valid@example.com";

    describe("New User does not exist for such email", () => {      
      test("response status 404", async () => {
        const user = new User({ email, status: "active", password: "P@ssw0rd123" });
        await user.save();

        const response = await request(app)
          .post('/users/verification')
          .set('Accept', 'application/json')
          .send({ email  })

        expect(response.status).toBe(404);
        expect(response.body.messages).toEqual(['Record not found']);
      });
    });

    describe("New user exist for such email", () => {
      let user;
      let response;

      const getVerification = async () => {
        user = new User({ email, password: "P@ssw0rd123" });
        await user.save();

        response = await request(app)
          .post('/users/verification')
          .set('Accept', 'application/json')
          .send({ email  })
      }
      
      test("response status 204", async () => {
        await getVerification();
        expect(response.status).toBe(204);
      });

      test("verification created", async() => {
        await getVerification();
        expect(async () => {
          await UserVerification.findOne({ email, expiresAt: { "$gt": new Date() } }).orFail();
        })
      })
    });
  });
});