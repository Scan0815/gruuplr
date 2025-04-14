import { Group } from '../groups/group.model';
import { KeyStoreEntry } from '../keystore/keystore.model';

export interface ReplicationRecord {
  id?: number;
  tableName: string;
  operation: 'add' | 'put' | 'delete';
  data: Partial<Group|KeyStoreEntry>;
  timestamp: number;
  lastError?: string;
}