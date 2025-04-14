import { KeyStoreEntry } from './keystore.model';
import { AppDatabase } from '../../db/AppDatabase';
import { Table } from 'dexie';

export class KeystoreRepository {
  private table: Table<KeyStoreEntry, string>;

  constructor(db: AppDatabase) {
    this.table = db.keystore;
  }

  async addKey(entry: KeyStoreEntry): Promise<string> {
    await this.table.add(entry);
    return entry.id;
  }

  async updateKey(id: string, changes: Partial<KeyStoreEntry>): Promise<number> {
    const updated = await this.table.update(id, changes);
    if (!updated) {
      throw new Error(`Key with id ${id} not found.`);
    }
    return updated;
  }

  async getActiveKey(groupId: string): Promise<KeyStoreEntry|undefined> {
    const keys = await  this.table
      .where('groupId')
      .equals(groupId)
      .reverse()
      .sortBy('createdAt');
    return keys.length ? keys[keys.length - 1] : undefined;
  }

  /**
   * Returns the current key for the given group.
   * Assumes that the current key is the one with the latest creation timestamp
   * that hasn't expired.
   */
  async getKey(keyId:string,groupId: string): Promise<KeyStoreEntry|undefined> {
   return this.table
     .where('[groupId+id]')
     .equals([groupId, keyId])
     .first();
  }
}