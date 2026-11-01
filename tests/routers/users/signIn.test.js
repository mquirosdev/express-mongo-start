import { describe, test, expect, vi } from 'vitest';
import request from 'supertest';

import app from "../../../src/app.js";
import User from '../../../src/models/User.js';

vi.mock("../../../src/services/jwtSession", () => ({
  createToken: vi.fn().mockReturnValue("test.test.test")
}));

describe("POST /api/v1/users/signin", () => {
  const invalidRequestMessages = [
    [" params required"],
    ["email invalid", "password required"],
    ["email invalid", "password invalid"],
    ["email invalid"]
  ];

  [
    null,
    {},
    { email: "  ", password: "  " },
    { email: "invalid@example", password: "P@ssw0rd" }
  ].forEach((body, idx) => {
    describe(`When invalid params ${idx}`, async () => {
      test("returns 422 status", async () => {
        const response = await request(app)
        .post('/api/v1/users/signin')
        .set('Accept', 'application/json')
        .send(body)

        expect(response.status).toBe(422);
        invalidRequestMessages[idx].forEach(msg => {
          expect(response.body.messages).toContain(msg);
        });
      });
    });
  });

  describe("when valid params", () => {
    const email = "valid@example.com";
    const password = "P@ssw0rd";

    const createUser = async (email, password, status) => {
      const user = new User({ email, password, status });
      await user.save();
    }

    describe("when user not found by email", () => {
      test("returns 422 status", async () => {
        const response = await request(app)
        .post('/api/v1/users/signin')
        .set('Accept', 'application/json')
        .send({ email, password });

        expect(response.status).toBe(422);
        expect(response.body.messages).toEqual(["credentials invalid"])
      });
    });

    describe("when non active user found by email", () => {
      test("returns 422 status", async () => {
        await createUser(email, password, "new");
        const response = await request(app)
        .post('/api/v1/users/signin')
        .set('Accept', 'application/json')
        .send({ email, password });

        expect(response.status).toBe(422);
        expect(response.body.messages).toEqual(["credentials invalid"])
      });
    });

    describe("when active user found by email but wrong password", () => {
      test("returns 422 status", async () => {
        await createUser(email, "0therP@ssw0rd", "active");
        const response = await request(app)
        .post('/api/v1/users/signin')
        .set('Accept', 'application/json')
        .send({ email, password });

        expect(response.status).toBe(422);
        expect(response.body.messages).toEqual(["credentials invalid"])
      });
    });

    describe("when active user found by email and correct password", () => {
      test("returns 200 status", async () => {
        await createUser(email, password, "active");
        const response = await request(app)
        .post('/api/v1/users/signin')
        .set('Accept', 'application/json')
        .send({ email, password });

        expect(response.status).toBe(200);
        expect(response.body.authToken).toEqual("test.test.test");
      });
    });
  });
});