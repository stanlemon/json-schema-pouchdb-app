import "isomorphic-fetch";
import PouchDB from "pouchdb";
import { parseISO, isBefore } from "date-fns";
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
      await db.reset();
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

  const now = new Date();

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
    expect(isBefore(parseISO(document.created), now)).toBe(true);
    expect(document.lastUpdated).not.toBeNull();
    expect(isBefore(parseISO(document.lastUpdated), now)).toBe(true);

    data = {
      ...data,
      howdy: "doody",
    };

    await db.saveDocument(documentName, documentId, data);

    let original = { ...document };
    document = await db.getDocument(documentName, documentId);

    expect(document).toMatchObject(data);
    expect(document.created).toEqual(original.created);
    expect(
      isBefore(parseISO(original.lastUpdated), parseISO(document.lastUpdated))
    );

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
