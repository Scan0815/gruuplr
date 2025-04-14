import { KeystoreRepository } from './keystore.repository';
import { KeyStoreEntry } from './keystore.model';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/AppDatabase';

export class KeystoreService {
  private repository: KeystoreRepository;

  constructor(repository?: KeystoreRepository) {
    this.repository = repository || new KeystoreRepository(db);
  }

  /**
   * Adds a new encryption key to the keystore.
   */
  addKey(groupId: string, newEncryptionKey: ArrayBuffer){
    const newKey: KeyStoreEntry = {
      id: uuidv4(),
      groupId,
      encryptionKey: newEncryptionKey,
      createdAt: Date.now(),
    };
    return this.repository.addKey(newKey);
  }


  /**
   * Retrieves the current encryption key for the given group.
   */
  async getKey(keyId:string,groupId: string): Promise<KeyStoreEntry | undefined> {
    return await this.repository.getKey(keyId,groupId);
  }

  async getActiveKey(groupId: string): Promise<KeyStoreEntry | undefined> {
    return await this.repository.getActiveKey(groupId);
  }

}