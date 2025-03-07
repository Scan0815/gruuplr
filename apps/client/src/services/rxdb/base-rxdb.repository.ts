import { RxCollection, RxDocument } from 'rxdb';
import { RxDBService } from './rxdb.service';

export abstract class BaseRxDBRepository<T> {
  protected collection!: RxCollection<T>;

  // Each subclass must provide a collection name and schema.
  protected abstract collectionName: string;
  protected abstract schema: any;

  /**
   * Initialize the collection by retrieving it from the centralized RxDBService.
   */
  public async initCollection(): Promise<void> {
    const db = await RxDBService.initDB();
    // Check if the collection exists on the database.
    if (!db.collections[this.collectionName]) {
      // Add the collection and capture the returned object.
      const collections = await db.addCollections({
        [this.collectionName]: { schema: this.schema },
      });
      this.collection = collections[this.collectionName];
    } else {
      this.collection = db.collections[this.collectionName];
    }
  }

  /**
   * Upsert a document into the collection.
   */
  public async upsert(doc: T): Promise<void> {
    if (!this.collection) {
      await this.initCollection();
    }
    await this.collection.upsert(doc);
  }

  /**
   * Find documents in the collection.
   */
  public async find(query: any = null): Promise<RxDocument<T>[]> {
    if (!this.collection) {
      await this.initCollection();
    }
    return this.collection.find(query).exec();
  }

  public async findOne(query: any = null): Promise<RxDocument<T>|null> {
    if (!this.collection) {
      await this.initCollection();
    }
    return this.collection.findOne(query).exec();
  }

  /**
   * Remove documents matching a query.
   */
  public async remove(query: any): Promise<void> {
    if (!this.collection) {
      await this.initCollection();
    }
    const docs = await this.collection.find(query).exec();
    await Promise.all(docs.map((doc) => doc.remove()));
  }
}