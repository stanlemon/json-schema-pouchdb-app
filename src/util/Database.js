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
    const { rev, rows } = await this.#fetchDocuments(name);

    const now = dayjs().toISOString();

    const row = { id: uuidv4(), ...data, created: now, lastUpdated: now };

    await this.#storeDocuments(name, rev, [...rows, row]);

    return row.id;
  }

  async saveDocument(name, id, row) {
    const { rows, rev } = await this.#fetchDocuments(name);

    await this.#storeDocuments(
      name,
      rev,
      rows.map((r) => {
        if (r.id === id) {
          return { ...row, id, created: r.created };
        } else {
          return r;
        }
      })
    );
  }

  async deleteDocument(name, id) {
    const { rows, rev } = await this.#fetchDocuments(name);

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
    const rows = (await this.getDocuments(name)).filter((row) => row.id === id);
    return rows.shift() ?? null; // In case undefined is returned, we explicitly return null;
  }

  async getDocuments(name) {
    const { rows } = await this.#fetchDocuments(name);
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows;
  }

  async #fetchDocuments(id) {
    try {
      const { rows, _rev: rev } = await this.#db.get(id);
      return { rev, rows };
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }

      const rev = await this.#storeDocuments(id, null, []);
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
