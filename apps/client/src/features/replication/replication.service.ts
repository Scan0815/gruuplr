import { db } from '../../db/AppDatabase';
import { ReplicationRecord } from './replication.model';

export class ReplicationService {

  static async createReplication(data:ReplicationRecord) {
    console.log('Creating replication service',data);
      await db.replicationQueue.add(data);
  }

}