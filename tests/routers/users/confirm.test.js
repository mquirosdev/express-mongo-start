import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { addMinutes } from 'date-fns';
import request from 'supertest';
import mongoose from 'mongoose';

import app from "../../../src/app.js";
import UserVerification from '../../../src/models/UserVerification.js';
import User from '../../../src/models/User.js';

let mongoServer;

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("PUT /api/v1/users/verification/confirm", () => {
  const email = "valid@example.com";

  const invalidRequestsResponses = [
    [" params required"],
    ["uuid required", "code required"],
    ["uuid invalid", "code invalid"],
    ["code invalid"]
  ];

  [
    null,
    {},
    { code: "  ", uuid: "  " },
    { code: "123", uuid: "12345" },
  ].forEach((body,idx) => {
    describe(`when invalid params ${idx}`, () => {
      test("returns status 422", async () => {
        const response = await request(app)
          .put('/api/v1/users/verification/confirm')
          .set('Accept', 'application/json')
          .send(body);
        
        expect(response.status).toBe(422);

        invalidRequestsResponses[idx].forEach(msg => {
          expect(response.body.messages).toContain(msg);
        });
      });
    });
  });

  describe("when expired verification", () => {
    test("confirmation returns 404", async () => {
      const verification = new UserVerification({ email });
      verification.generateCode();
      verification.expiresAt = addMinutes(new Date(), -10);
      await verification.save();

      const response = await request(app)
        .put('/api/v1/users/verification/confirm')
        .set('Accept', 'application/json')
        .send({ code: verification.code, uuid: verification.uuid });
      
      expect(response.status).toBe(404)
    });
  });

  describe("when valid verification and missing user for email", () => {
    test("confirmation returns 404", async () => {
      const verification = new UserVerification({ email });
      verification.generateCode();
      await verification.save();

      const response = await request(app)
        .put('/api/v1/users/verification/confirm')
        .set('Accept', 'application/json')
        .send({ code: verification.code, uuid: verification.uuid });
      
      expect(response.status).toBe(404)
    });
  });

  describe("when valid verification and present user for email", () => {
    test("confirmation returns 404", async () => {
      const user = new User({ email, password: "P@ssw0rd123" });
      await user.save();

      const verification = new UserVerification({ email });
      verification.generateCode();
      await verification.save();

      const response = await request(app)
        .put('/api/v1/users/verification/confirm')
        .set('Accept', 'application/json')
        .send({ code: verification.code, uuid: verification.uuid });
      
      expect(response.status).toBe(204)
    });
  });
});