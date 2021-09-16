const db = require("../data/dbConfig");
const request = require("supertest");
const server = require("./server");
const user = {
  username: "Jesse",
  password: "password",
};

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

it("correct env", () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("auth Router", () => {
  describe("[POST] /register", () => {
    it("returns 'username and password required' on bad payplad", async () => {
      const res = await request(server).post("/api/auth/register");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "username and password required"
      );
    });
    it("returns the newly added user", async () => {
      const res = await request(server).post("/api/auth/register").send(user);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 1, username: "Jesse" });
    });
    it("adds a user to the database", async () => {
      await request(server).post("/api/auth/register").send(user);
      expect(await db("users as u").select("u.id", "u.username")).toHaveLength(
        1
      );
    });
  });
  describe("[POST] /login", () => {
    it("returns the correct welcome string on success", async () => {
      await request(server).post("/api/auth/register").send(user);
      const res = await request(server).post("/api/auth/login").send(user);
      expect(res.body).toMatchObject({ message: "welcome, Jesse" });
    });
    it("returns 'username and password required' on bad payplad", async () => {
      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "Jesse" });
      expect(res.body).toHaveProperty(
        "message",
        "username and password required"
      );
    });
    it("returns 'invalid credentials' on bad payplad", async () => {
      const res = await request(server)
        .post("/api/auth/login")
        .send({ username: "JesseLeegs", password: "password" });
      expect(res.body).toHaveProperty("message", "invalid credentials");
    });
  });
});

describe("Jokes Router", () => {
  it("returns with 'Token required' if someone with out a valid token calls [GET] /jokes", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.body).toHaveProperty("message", "Token required");
  });
  it("requests with a valid token obtain a list of jokes", async () => {
    await request(server).post("/api/auth/register").send(user);
    let res = await request(server).post("/api/auth/login").send(user);

    res = await request(server)
      .get("/api/jokes")
      .set("authorization", res.body.token);
    expect(res.body.length).toBe(3);
  }, 750);
});
