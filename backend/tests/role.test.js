// tests/role.test.js
const request = require("supertest");
const app = require("../server");

describe("Role Management", () => {
  it("should block access without session", async () => {
    const res = await request(app).get("/dashboard");
    expect(res.statusCode).toBe(401);
  });
});
