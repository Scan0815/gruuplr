# Local Database Documentation

## Overview
The application uses DexieJS as a wrapper for IndexedDB to provide offline data persistence and synchronization capabilities.

## Database Configuration
The database configuration is located in `apps/client/src/db/AppDatabase.ts`:

```typescript
import Dexie, { Table } from 'dexie';
import { User } from '../features/users/user.model';
import { Group } from '../features/groups/group.model';
import { ReplicationRecord } from '../features/replication/replication.model';
import { ReplicationMiddleware } from './middleware/replication.middleware';

export class AppDatabase extends Dexie {
  public users: Table<User, string>;
  public groups: Table<Group, string>;
  public replicationQueue: Table<ReplicationRecord, number>;
  public keystore: Table<{
    id: string;
    groupId: string;
    encryptionKey: ArrayBuffer;
    createdAt: Date;
  }, string>;

  constructor() {
    super('appDB');
    this.version(3).stores({
      users: '&id, name, eMail, accessToken, refreshToken, active, createdAt, updatedAt',
      groups: '&id, *userId, name, description, createdAt, *memberIds, updatedAt',
      keystore: '&id, groupId, createdAt, encryptionKey, [groupId+id], [groupId+createdAt]',
      replicationQueue: '++id, tableName, operation, timestamp'
    });
    this.users = this.table('users');
    this.groups = this.table('groups');
    this.keystore = this.table('keystore');
    this.replicationQueue = this.table('replicationQueue');
    this.use(new ReplicationMiddleware());
  }
}
```

## Database Schemas

### User Schema
```typescript
interface User {
  id: string;
  name: string;
  eMail: string;
  accessToken: string;
  refreshToken: string;
  active: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Group Schema
```typescript
interface GroupMember {
  userId: string;
  role: "user" | "admin";
}

interface Group {
  id: string;
  name: string;
  description?: string;
  userId: string;
  memberIds: string[];
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Keystore Schema
```typescript
interface KeyStoreEntry {
  id: string;
  groupId: string;
  encryptionKey: ArrayBuffer;
  createdAt: Date;
  validUntil?: Date;
}
```

### Replication Record Schema
```typescript
interface ReplicationRecord {
  id?: number;
  tableName: string;
  operation: 'add' | 'put' | 'delete';
  data: Partial<Group>;
  timestamp: number;
}
```

## Database Operations

### Basic CRUD Operations
```typescript
// Create
await db.users.add(user);

// Read
const user = await db.users.get(id);
const activeUser = await db.users.where('active').equals(1).first();

// Update
await db.users.update(id, { active: 0 });

// Delete
await db.users.delete(id);
```

### Indexed Queries
```typescript
// Query by email
const user = await db.users.where('eMail').equals(email).first();

// Query by group membership
const userGroups = await db.groups
  .where('memberIds')
  .equals(userId)
  .filter(group => !group.deletedAt)
  .toArray();

// Query keystore by group
const groupKey = await db.keystore
  .where('[groupId+id]')
  .equals([groupId, keyId])
  .first();
```

## Data Synchronization

### Replication Middleware
The application uses a custom ReplicationMiddleware to track changes in the groups and keystore tables. When changes occur:
1. Changes are tracked in the replicationQueue
2. Changes are synced when online
3. Conflicts are handled appropriately

### Sync Status Tracking
```typescript
interface ReplicationRecord {
  id?: number;
  tableName: string;
  operation: 'add' | 'put' | 'delete';
  data: Partial<Group>;
  timestamp: number;
}
```

## Best Practices

### Error Handling
```typescript
try {
  await db.transaction('rw', [db.groups, db.keystore], async () => {
    // Transaction operations
  });
} catch (error) {
  console.error('Database operation failed:', error);
  // Handle error appropriately
}
```

### Performance Considerations
- Use appropriate indexes for frequent queries
- Implement pagination for large datasets
- Clean up old data periodically
- Monitor database size

### Data Migration
When updating the database schema:
1. Increment version number in constructor
2. Define new schema in stores configuration
3. Implement migration logic if needed
4. Test migration process

## Monitoring and Maintenance

### Database Size
```typescript
async function getDatabaseSize(): Promise<number> {
  const estimate = await navigator.storage.estimate();
  return estimate.usage || 0;
}
```

### Cleanup Operations
```typescript
async function cleanupDeletedGroups(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await db.groups
    .where('deletedAt')
    .below(thirtyDaysAgo)
    .delete();
}
```

## Testing

### Unit Tests
```typescript
describe('Database Operations', () => {
  let db: AppDatabase;

  beforeEach(async () => {
    db = new AppDatabase();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should create a new user', async () => {
    const user = {
      id: 'test-id',
      name: 'Test User',
      eMail: 'test@example.com',
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
      active: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.users.add(user);
    const savedUser = await db.users.get(user.id);
    
    expect(savedUser).toEqual(user);
  });
});
``` 