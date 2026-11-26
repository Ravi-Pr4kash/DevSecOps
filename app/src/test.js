
const request = require("supertest");
const app = require("./server");
const User = require("./userModel");

// Mock MongoDB model
jest.mock("./userModel");

describe("DevSecOps API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET / should return API message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "DevSecOps API is running"
    );
  });

  test("GET /health should return healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("healthy");
  });

  test("POST /api/users should create a user", async () => {
    const user = {
      _id: "123",
      name: "Ravi",
      email: "ravi@example.com",
      role: "developer",
    };

    User.create.mockResolvedValue(user);

    const response = await request(app)
      .post("/api/users")
      .send({
        name: "Ravi",
        email: "ravi@example.com",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe("Ravi");
    expect(User.create).toHaveBeenCalled();
  });

  test("GET /api/users should fetch all users", async () => {
    const users = [
      {
        _id: "123",
        name: "Ravi",
        email: "ravi@example.com",
        role: "developer",
      },
    ];

    User.find.mockResolvedValue(users);

    const response = await request(app).get("/api/users");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Ravi");
  });

  test("GET /api/users/:id should fetch a user", async () => {
    const user = {
      _id: "123",
      name: "Ravi",
      email: "ravi@example.com",
      role: "developer",
    };

    User.findById.mockResolvedValue(user);

    const response = await request(app).get("/api/users/123");

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("Ravi");
  });

  test("DELETE /api/users/:id should delete a user", async () => {
    User.findByIdAndDelete.mockResolvedValue({
      _id: "123",
      name: "Ravi",
    });

    const response = await request(app).delete(
      "/api/users/123"
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "User deleted successfully"
    );
  });
});
