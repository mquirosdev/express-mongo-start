import { describe, test, expect, vi, beforeAll, beforeEach } from "vitest";
import { ZodError } from "zod";

import handleCreate from "../../../src/controllers/users/handleCreate.js";
import presentUser from "../../../src/presenters/presentUser.js";
import User from "../../../src/models/User.js";

vi.mock("../../../src/services/digestPasswordString.js", () => ({
  default: vi.fn(() => ["digest", "salt"])
}));

describe("When request body empty", () => {
  test("raises ZodError with issues", async () => {
    const req = { body: null }
    try {
      await handleCreate(req, {})
    } catch(err) {
      expect(err instanceof ZodError).toBeTruthy();
      expect(err.issues).toHaveLength(1);
      expect(err.issues[0]['expected']).toEqual('object');
    }
  });
});

const invalidParams = [
  null,
  {},
  { email: "", password: "" },
  { email: "  ", password: "             " },
  { email: "invalid@example", password: "123" },
  { email: "invalid@example.com", password: "123" },
  { email: "invalid@example", password: "P@ssw0rd123" }
];

const invalidParamsPaths = [
  [""],
  ["email", "password"],
  ["email", "password"],
  ["email", "password"],
  ["email", "password"],
  ["password"],
  ["email"]
]

invalidParams.forEach((body, idx) => {
  describe(`Invalid params ${idx}`, () => {
    test("raises ZodError with issues", async () => {
      const req = { body }
      try {
        await handleCreate(req, {})
      } catch(err) {
        expect(err instanceof ZodError).toBeTruthy();
        const missingPaths = err.issues.map(issue => issue.path.join('.'));
        invalidParamsPaths[idx].forEach(path => {
          expect(missingPaths).toContain(path);  
        })
      }
    });
  });
})

describe("When request required body params are correct", () => {
  const email = "test@example.com";
  const password = "P@ssw0rd123";
  const req = { body: { email, password } };
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };

  beforeEach(() => vi.clearAllMocks());

  test("create user", async () => {
    await handleCreate(req, res);
    const user = await User.findOne({ email }).orFail();
    expect(user.email).toEqual(email);
    expect(user.status).toEqual("new");
    expect(user.passwordDigest).toEqual("digest");
    expect(user.salt).toEqual("salt");
  });

  test("return status 201", async () => {
    await handleCreate(req, res);
    const user = await User.findOne({ email }).orFail();
    expect(res.status).toHaveBeenCalledExactlyOnceWith(201);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(presentUser(user))
  });
});
