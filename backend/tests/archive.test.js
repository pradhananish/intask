const db = require("../db"); // your DB connection

describe("Data Archiving Process", () => {
  beforeAll(async () => {
    await db("theft_logs").insert([
      { id: 100, location: "Test Store", item: "Camera", created_at: "2020-01-01" }
    ]);
  });

  test("moves old data to archive", async () => {
    await require("../scripts/archiveData")(); // run the archive function

    const main = await db("theft_logs").where({ id: 100 });
    const archived = await db("theft_logs_archive").where({ id: 100 });

    expect(main.length).toBe(0);
    expect(archived.length).toBe(1);
    expect(archived[0].item).toBe("Camera");
  });
});
