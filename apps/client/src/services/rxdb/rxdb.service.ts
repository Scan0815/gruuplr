// File: /apps/client/src/services/rxdb.service.ts
import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

export class RxDBService {
  private static dbInstance: RxDatabase | null = null;

  /**
   * Initializes the RxDB database if not already initialized.
   */
  public static async initDB(): Promise<RxDatabase> {
    if (!this.dbInstance) {
      this.dbInstance = await createRxDatabase({
        name: 'gruuplrDB', // database name
        storage: getRxStorageDexie(),
        multiInstance: false,
        eventReduce: true,
      });
    }
    return this.dbInstance;
  }

  /**
   * Gets or creates a collection.
   * @param name The name of the collection.
   * @param schema The RxDB JSON schema.
   */
  public static async getCollection(name: string, schema: any): Promise<RxCollection> {
    const db = await this.initDB();
    // If the collection isn't already added, add it
    if (!db.collections[name]) {
      await db.addCollections({
        [name]: { schema },
      });
    }
    return db.collections[name];
  }
}