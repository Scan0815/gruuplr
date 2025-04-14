import { User } from '../features/users/user.model';
import { Group } from '../features/groups/group.model';
import Dexie, { Table } from 'dexie';
import { ReplicationRecord } from '../features/replication/replication.model';
import { ReplicationMiddleware } from './middleware/replication.middleware';

export class AppDatabase extends Dexie {
  public users: Table<User, string>;
  public groups: Table<Group, string>;
  public replicationQueue: Table<ReplicationRecord, number>;
  public keystore: Table<
    {
      id: string;
      groupId: string;
      encryptionKey: ArrayBuffer;
      createdAt: Date;
    },
    string
  >;

  constructor() {
    super('appDB');
    this.version(3).stores({
      users:
        '&id, name, eMail, accessToken, refreshToken, active, createdAt, updatedAt',
      groups: '&id, *userId, name, description, createdAt,*memberIds, updatedAt',
      keystore:
        '&id, groupId, createdAt, encryptionKey, [groupId+id], [groupId+createdAt]',
      replicationQueue: '++id, tableName, operation, timestamp',
    });
    this.users = this.table('users');
    this.groups = this.table('groups');
    this.keystore = this.table('keystore');
    this.replicationQueue = this.table('replicationQueue');
    this.use(new ReplicationMiddleware());
  }
}

export const db = new AppDatabase();
