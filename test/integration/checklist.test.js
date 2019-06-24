const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("./../../models/user");
const { Checklist } = require("../../models/checklist");
let server;
const mainPath = "/api/checklists";

describe("/api/checklists", () => {
  beforeEach(async () => {
    server = require("../../index");
  });

  afterEach(async () => {
    await Checklist.deleteMany({});
    return server.close();
  });

  describe("GET /all", () => {
    let checklists;
    let users;
    let token;

    beforeEach(async () => {
      users = [
        { _id: mongoose.Types.ObjectId(), email: "test1@test.com" },
        { _id: mongoose.Types.ObjectId(), email: "test2@test.com" }
      ];
      checklists = [
        {
          name: "test1",
          items: [{ name: "bobby" }, { name: "benben" }],
          user: users[0]
        },
        {
          name: "test2",
          items: [{ name: "bobby" }, { name: "benben" }, { name: "bloopers" }],
          user: users[1]
        },
        {
          name: "test3",
          items: [{ name: "bobby" }, { name: "benben" }, { name: "bloopers" }],
          user: users[0]
        }
      ];

      token = new User({ isAdmin: true }).generateAuthToken();
      await Checklist.insertMany(checklists);
    });

    const exec = () => {
      return request(server)
        .get(mainPath + "/all")
        .set("x-auth-token", token);
    };

    it("should return 401 if unauthorized user (not logged in)", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if a user which is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 200 if a valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return all checklists if a valid request", async () => {
      const res = await exec();

      expect(res.body[0]).toHaveProperty("name", checklists[0].name);
      expect(res.body[1]).toHaveProperty("name", checklists[1].name);
      expect(res.body[2]).toHaveProperty("name", checklists[2].name);
    });
  });

  describe("POST /", () => {
    //  ---TEST CASES---
    //return 401 if user is not logged in
    //return 400 if the checklist is not valid
    //return 200 if request is valid
    //return new checklist if request is valid
    //should save the checklist into the db

    let user;
    let token;
    let checklist;

    beforeEach(async () => {
      user = new User({ email: "test@test.com" });
      token = user.generateAuthToken();
      checklist = {
        name: "Test Checklist"
      };
    });

    const exec = () => {
      return request(server)
        .post(mainPath)
        .set("x-auth-token", token)
        .send(checklist);
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if checklist not valid", async () => {
      checklist = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it("should return the checklist if request is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", checklist.name);
    });

    it("should save the checklist in the db if request is valid", async () => {
      await exec();

      const checklistInDb = await Checklist.findOne({ name: checklist.name });

      expect(checklistInDb).toHaveProperty("_id");
      expect(checklistInDb).toHaveProperty("name", checklist.name);
      expect(checklistInDb).toHaveProperty("user.email", user.email);
    });
  });

  describe("GET /", () => {
    //--- TEST CASES ---
    //return 401 if user is not logged in.
    //return 200 if request is valid.
    //return all user checklists if request is valid
    let token;
    let users;
    let checklists;

    beforeEach(async () => {
      //init user objects:
      users = [
        { _id: mongoose.Types.ObjectId(), email: "test1@test.com" },
        { _id: mongoose.Types.ObjectId(), email: "test2@test.com" }
      ];

      //init token:
      token = new User(users[0]).generateAuthToken();

      //init checklist objects:
      checklists = [
        {
          name: "test1",
          items: [{ name: "bobby" }, { name: "benben" }],
          user: users[0]
        },
        {
          name: "test2",
          items: [{ name: "bobby" }, { name: "benben" }, { name: "bloopers" }],
          user: users[1]
        },
        {
          name: "test3",
          items: [{ name: "bobby" }, { name: "benben" }, { name: "bloopers" }],
          user: users[0]
        }
      ];

      //save chekclists into the database:
      await Checklist.insertMany(checklists);
    });

    //execution method:
    const exec = () => {
      return request(server)
        .get(mainPath)
        .set("x-auth-token", token);
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return all user checklists if request is valid", async () => {
      const res = await exec();

      //Expect the response body length to be 2:
      expect(res.body.length).toBe(2);
      //Expect the response body to include a an object containing the property {name: "test1"}
      // and anothe containing {name: "test3"}.
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "test1",
            name: "test3"
          })
        ])
      );
    });
  });

  describe("PUT /:id", () => {
    //--- TEST CASES ---
    // return 401 if user is not logged in
    // return 400 if checklist sent is not valid.
    //return 400 if id sent is not valid
    // return 404 if no checklist found for this user id.
    // return 200 if request is valid.
    // return new checklist if request is valid.
    // change checklist in db if request is valid.

    let token;
    let user;
    let checklist;
    let checklistId;
    let checklistUpdated;

    beforeEach(async () => {
      user = new User({ email: "test@test.com" });
      token = user.generateAuthToken();
      checklist = new Checklist({ name: "test1", user });
      await checklist.save();
      checklistId = checklist._id;
      checklistUpdated = { name: "test2" };
    });

    const exec = () => {
      return request(server)
        .put(mainPath + "/" + checklistId)
        .set("x-auth-token", token)
        .send(checklistUpdated);
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if checklist sent is not valid", async () => {
      checklistUpdated = { invalid: true };

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if checklist id sent is not valid", async () => {
      checklistId = "invalid id";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no user-checklist combo found", async () => {
      checklistId = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return the new checklist if request is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("name", checklistUpdated.name);
    });

    it("should update checklist in DB if request is valid", async () => {
      await exec();

      const checklistInDb = await Checklist.findOne({ _id: checklistId });

      expect(checklistInDb).toHaveProperty("name", checklistUpdated.name);
    });
  });

  describe("DELETE /:id", () => {
    //--- TEST CASES ---
    // return 401 if user is not logged in
    // return 400 if id sent is not valid
    // return 404 if no checklist found for this user id.
    // return 200 if request is valid.
    // return deleted checklist.
    // delete the checklist from the db.

    let user;
    let token;
    let checklist;
    let checklistId;

    beforeEach(async () => {
      user = new User({ email: "test@test.com" });
      token = user.generateAuthToken();
      checklist = new Checklist({ name: "testList", user: user });
      checklistId = checklist._id;

      await checklist.save();
    });

    const exec = () => {
      return request(server)
        .delete(mainPath + "/" + checklistId)
        .set("x-auth-token", token);
    };

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if checklist id sent is not valid", async () => {
      checklistId = "invalid id";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no user-checklist combo found", async () => {
      checklistId = mongoose.Types.ObjectId().toHexString();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return deleted checklist if request is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", checklistId.toHexString());
      expect(res.body).toHaveProperty("name", checklist.name);
    });

    it("should delete checklist from db if request is valid", async () => {
      await exec();

      const checklistInDb = await Checklist.findOne({ _id: checklistId });

      expect(checklistInDb).toBeNull();
    });
  });
});
