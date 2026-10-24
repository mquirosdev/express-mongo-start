import { describe, test, expect, vi, beforeEach } from "vitest";
import { ZodError } from "zod";
import { Error } from "mongoose";

import User from "../../../src/models/User.js";
import UserVerification from "../../../src/models/UserVerification.js";
import getVerificationHandler from "../../../src/controllers/users/getVerificationHandler.js";

describe("When request body is null", () => {
  test("raises ZodError with issues", async () => {
    const req = { body: null }
    try {
      await getVerificationHandler(req, {})
    } catch(err) {
      expect(err instanceof ZodError).toBeTruthy();
      expect(err.issues).toHaveLength(1);
      expect(err.issues[0]['expected']).toEqual('object');
    }
  });
});

["", "  ", "invalid@example"].forEach(email => {
  describe(`When email = "${email}"`, () => {
    test("raises ZodError with issues", async () => {
      const req = { body: { email } }

      try {
        await getVerificationHandler(req, {})
      } catch(err) {
        expect(err instanceof ZodError).toBeTruthy();
        const invalidParams = err.issues.map(issue => issue.path.join('.'));
        expect(invalidParams).toContain('email');
      }
    });
  });
});

describe("when request body valid", () => {
  let res;
  const email = "valid@example.com";
  const req = { body: { email: email } };
    
  beforeEach(() => {
    res = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() };
  });

  describe("User does not exist for email", () => {
    test("Throws DocumentNotFoundError", async () => {
      const user = new User({ email, status: "active", password: "P@ssw0rd123" });
      await user.save();

      try {
        await getVerificationHandler(req, res);
      } catch(err) {
        expect(err instanceof Error.DocumentNotFoundError).toBeTruthy();
      }
    });
  });

  describe("User exist and first verification", () => {
    let user;
    let verification;

    const getVerification = async () => {
      user = new User({ email, password: "P@ssw0rd123" });
      await user.save();
      await getVerificationHandler(req, res);
      verification = await UserVerification.findOne({ 
        email,
        expiresAt: { "$gt": new Date() }
      }).orFail();
    };

    test("Set status to 204", async () => {
      await getVerification();

      expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
      expect(res.send).toHaveBeenCalledExactlyOnceWith();
    });

    test("Creates verification", async () => {
      await getVerification();
      expect(verification.code).toHaveLength(6);
      expect(verification.uuid.length()).toBe(16);
    });
  });

  describe("User exist and second verification", () => {
    test("Creates verification", async () => {
      const user = new User({ email, password: "P@ssw0rd123" });
      await user.save();

      let verification = new UserVerification({ email })
      verification.generateCode();
      await verification.save();

      await getVerificationHandler(req, res);
      
      verification = await UserVerification.findOne({ 
        email,
        expiresAt: { "$gt": new Date() }
      }).orFail();
      
      expect(verification.code).toHaveLength(6);
      expect(verification.uuid.length()).toBe(16);

      expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
      expect(res.send).toHaveBeenCalledExactlyOnceWith();
    });
  });
});