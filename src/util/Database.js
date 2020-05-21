import PouchDB from "pouchdb";
import dayjs from "dayjs";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

const SCHEMAS_DOCUMENT_ID = "schemas";

export default class Database {
  /**
   * @type {PouchDB}
   */
  #db;

  constructor(db) {
    this.#db = db;
  }

  async reset() {
    const { schemas, rev } = await this.#fetchSchemas();

    await this.#storeSchemas(rev, {});
  }

  async createSchema(title, schema = SAMPLE_DATA) {
    if (!title || !schema) {
      throw new Error(
        "Title and an object definition are required to create a schema"
      );
    }

    const { schemas, rev } = await this.#fetchSchemas();

    const id = slugify(title, { lower: true });

    await this.#storeSchemas(rev, {
      ...schemas,
      [id]: { id, title, schema },
    });
  }

  async saveSchema(id, title, schema) {
    const { schemas, rev } = await this.#fetchSchemas();

    await this.#storeSchemas(rev, {
      ...schemas,
      [id]: {
        id,
        title,
        schema,
      },
    });
  }

  async deleteSchema(id) {
    const { schemas: all, rev } = await this.#fetchSchemas();
    const { [id]: deleted, ...schemas } = all;

    await this.#storeSchemas(rev, schemas);
  }

  async #storeSchemas(rev, schemas) {
    const doc = await this.#db.put({
      _id: SCHEMAS_DOCUMENT_ID,
      _rev: rev,
      schemas,
    });

    return doc.rev;
  }

  async getSchema(id) {
    return (await this.getSchemas())?.[id];
  }

  async getSchemas() {
    const { schemas } = await this.#fetchSchemas();
    return schemas;
  }

  async #fetchSchemas() {
    try {
      const { schemas, _rev: rev } = await this.#db.get(SCHEMAS_DOCUMENT_ID);
      return { schemas, rev };
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      const rev = await this.#storeSchemas(null, {});
      return { rev, schemas: {} };
    }
  }

  async createDocument(name, data = {}) {
    const { rev, rows } = this.#fetchDocument(name);

    const now = dayjs().toISOString();

    const row = { id: uuidv4(), ...data, created: now, lastUpdated: now };

    await this.#storeDocument(name, { rows: [...rows, ...row] });
  }

  async saveDocument(name, id, row) {
    const { rows } = this.#fetchDocument(name);

    await this.#storeDocument(
      name,
      rows.map((row) => {
        if (r.id === id) {
          return row;
        } else {
          return r;
        }
      })
    );
  }

  async deleteDocument(name, id) {
    const { rows, rev } = await this.#fetchDocuments();

    await this.#storeDocuments(
      name,
      rev,
      rows.filter((row) => row.id !== id)
    );
  }

  async #storeDocuments(id, rev, rows) {
    const doc = await this.#db.put({
      _id: id,
      _rev: rev,
      rows,
    });

    return doc.rev;
  }

  async getDocument(name, id) {
    return await this.getDocuments(name).filter((row) => row.id === id)?.[0];
  }

  async getDocuments(name) {
    return await this.#fetchDocument(id);
  }

  async #fetchDocument(id) {
    try {
      const { rows, _rev: rev } = await this.#db.get(id);
      return { rev, rows };
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      const rev = await this.#storeDocument(rows);
      return { rev, rows: [] };
    }
  }
}

const SAMPLE_DATA = {
  required: ["firstName", "lastName"],
  properties: {
    firstName: {
      title: "First Name",
      type: "string",
    },
    lastName: {
      title: "Last Name",
      type: "string",
    },
  },
};
