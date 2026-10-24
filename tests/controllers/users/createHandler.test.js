import { describe, test, expect, vi } from "vitest";
import { ZodError } from "zod";

import createHandler from "../../../src/controllers/users/createHandler.js";
import UserPresenter from "../../../src/presenters/UserPresenter.js";
import User from "../../../src/models/User.js";


describe("When request body empty", () => {
  test("raises ZodError with issues", async () => {
    const req = { body: null }
    try {
      await createHandler(req, {})
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
        await createHandler(req, {})
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
  test("raises ZodError with issues", async () => {
    const email = "test@example.com";
    const req = { body: { email, password: "P@ssw0rd-test"} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    await createHandler(req, res);
    
    const users = await User.find({ email });
    expect(users).toHaveLength(1);
    
    expect(res.status).toHaveBeenCalledExactlyOnceWith(201);
    expect(res.json).toHaveBeenCalledExactlyOnceWith(new UserPresenter(users[0]).values)
  });
});
