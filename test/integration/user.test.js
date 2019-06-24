const { User } = require("./../../models/user");
const request = require("supertest");
let server;

beforeEach(async () => {
  server = require("../../index");
});
afterEach(async () => {
  await User.deleteMany({});
  await server.close();
});

describe("/api/user", () => {
  const path = "/api/users";

  describe("POST /", () => {
    //--- TEST CASES ---
    //should return status 400 if user object is not valid.
    //should return status 400 if user exists by email.
    //should return status 200 if request is valid.
    //should hash password.
    //should store user in the database.

    let user;

    beforeEach(() => {
      user = {
        email: "validemail@test.com",
        firstName: "Test",
        password: "validpassword"
      };
    });

    const exec = () => {
      return request(server)
        .post(path)
        .send(user);
    };

    it("should return status 400 id user object is not valid", async () => {
      user = { name: "invalid User" };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return status 400 id user exists by email", async () => {
      const user2 = new User({
        email: user.email,
        firstName: "TestB",
        password: "validPassword2"
      });

      await user2.save();

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/^.*exist.*$/);
    });

    it("should return status 200 if request is valid.", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should hash password and save user in db if request is valid", async () => {
      await exec();

      const userInDb = await User.findOne({ email: user.email });

      expect(userInDb).toHaveProperty("_id");
      expect(userInDb).toHaveProperty("email", user.email);
      expect(userInDb).toHaveProperty("firstName", user.firstName);
      expect(userInDb.password).not.toMatch(user.password);
    });
  });
});
