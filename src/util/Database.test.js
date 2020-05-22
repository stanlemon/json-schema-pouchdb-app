import "isomorphic-fetch";
import PouchDB from "pouchdb";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Database from "./Database";

PouchDB.plugin(require("pouchdb-adapter-memory"));

dayjs.extend(isSameOrBefore);

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

  const now = dayjs();

  it("create, update and delete a document", async () => {
    const documentName = "my-test-document-id";

    let data = {
      foo: "bar",
      hello: "world",
    };

    let documentId = await db.createDocument(documentName, data);

    let document = await db.getDocument(documentName, documentId);

    expect(document).toMatchObject(data);
    expect(document.created).not.toBeNull();
    expect(now.isSameOrBefore(document.created)).toBe(true);
    expect(document.lastUpdated).not.toBeNull();
    expect(now.isSameOrBefore(document.lastUpdated)).toBe(true);

    data = {
      ...data,
      howdy: "doody",
    };

    await db.saveDocument(documentName, documentId, data);

    let original = { ...document };
    document = await db.getDocument(documentName, documentId);

    expect(document).toMatchObject(data);
    expect(document.created).toEqual(original.created);
    expect(dayjs(original.lastUpdated).isSameOrBefore(document.lastUpdated));

    await db.createDocument(documentName, "random-document-id", {
      test: "test",
    });

    let all = await db.getDocuments(documentName);

    expect(Object.keys(all).length).toEqual(2);

    await db.deleteDocument(documentName, documentId);

    document = await db.getDocument(documentName, documentId);

    expect(document).toBeNull();

    all = await db.getDocuments(documentName);

    expect(Object.keys(all).length).toEqual(1);
  });
});
