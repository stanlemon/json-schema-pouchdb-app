import PouchDB from "pouchdb";
import slugify from "slugify";

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
