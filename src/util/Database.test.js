import "isomorphic-fetch";
import PouchDB from "pouchdb";
import Database from "./Database";

PouchDB.plugin(require("pouchdb-adapter-memory"));

// Create a database instance in memory only
const pouchDb = new PouchDB("test", {
  adapter: "memory",
});
const db = new Database(pouchDb);

describe("database operations", () => {
  // Clear out all documents after each test
  afterEach(async () => {
    try {
      const allDocs = await pouchDb.allDocs();

      await pouchDb.bulkDocs(
        allDocs.rows.map((row) => ({
          _id: row.id,
          _rev: row.value.rev,
          _deleted: true,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  });

  it("create, update and delete a schema", async () => {
    // Should initialize the schema database, and create the hello-world schema
    await db.createSchema("Hello World", { foo: "bar" });

    let schema = await db.getSchema("hello-world");

    expect({
      id: "hello-world",
      title: "Hello World",
      schema: { foo: "bar" },
    }).toEqual(schema);

    await db.saveSchema(schema.id, "New Title", { foo: "baz" });

    schema = await db.getSchema("hello-world");

    expect({
      id: "hello-world",
      title: "New Title",
      schema: { foo: "baz" },
    }).toEqual(schema);

    await db.createSchema("Schema 2", { foo: "bar" });

    let all = await db.getSchemas();

    expect(Object.keys(all).length).toEqual(2);

    await db.deleteSchema("hello-world");

    all = await db.getSchemas();

    expect(Object.keys(all).length).toEqual(1);
    expect(all["hello-world"]).toBe(undefined);
  });

  it("reset database", async () => {
    await db.createSchema("one", { foo: "bar" });
    await db.createSchema("two", { foo: "bar" });
    await db.createSchema("three", { foo: "bar" });

    let all = await db.getSchemas();

    expect(Object.keys(all).length).toEqual(3);

    await db.reset();

    all = await db.getSchemas();

    expect(Object.keys(all).length).toEqual(0);
    expect(all).toEqual({});
  });
});
