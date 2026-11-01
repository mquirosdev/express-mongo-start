import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose, { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";

import User from "../../../src/models/User.js";
import UserVerification from "../../../src/models/UserVerification.js";
import handleConfirm from "../../../src/controllers/v1/users/handleConfirm.js";

let mongoServer;

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("handleConfirm", () => {
  let res;

  beforeEach(() => {
    res = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() };
  });

  test("rejects a null request body", async () => {
    await expect(handleConfirm({ body: null }, res)).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  test.each([
    ["uuid", "   ", "123456"],
    ["code", "valid-uuid", "   "],
    ["both", "   ", "   "],
  ])("rejects blank %s values", async (_label, uuid, code) => {
    await expect(
      handleConfirm({ body: { uuid, code } }, res),
    ).rejects.toBeInstanceOf(ZodError);
  });

  test("rejects a verification that does not exist or has expired", async () => {
    const verification = new UserVerification({ email: "verify@example.com" });
    verification.generateCode();
    verification.expiresAt = new Date(Date.now() - 1);
    await verification.save();

    await expect(
      handleConfirm(
        { body: { uuid: verification.uuid.toString(), code: verification.code } },
        res,
      ),
    ).rejects.toBeInstanceOf(MongooseError.DocumentNotFoundError);
  });

  test("expires the verification, activates the user, and responds with 200", async () => {
    const email = "verify@example.com";
    const user = new User({ email, password: "P@ssw0rd123" });
    await user.save();

    const verification = new UserVerification({ email });
    verification.generateCode();
    await verification.save();

    await handleConfirm(
      { body: { uuid: verification.uuid.toString(), code: verification.code } },
      res,
    );

    const updatedVerification = await UserVerification.findOne({ email }).orFail();
    const updatedUser = await User.findOne({ email }).orFail();

    expect(updatedVerification.expiresAt.valueOf()).toBeLessThan(Date.now());
    expect(updatedUser.status).toBe("active");
    expect(res.status).toHaveBeenCalledExactlyOnceWith(204);
    expect(res.send).toHaveBeenCalledExactlyOnceWith();
  });
});
