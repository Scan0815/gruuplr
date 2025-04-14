// src/replication/replication.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReplicationRecord, ReplicationRecordDocument } from './schemas/replication-record.schema';
import { Binary } from 'mongodb';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class ReplicationService {
  constructor(
    @InjectModel(ReplicationRecord.name)
    private readonly replicationModel: Model<ReplicationRecordDocument>,
    private readonly groupService: GroupsService,
  ) {}

  /**
   * Save replication records and distribute them to relevant users
   */
  async saveReplication(userId: string, records: ReplicationRecord[]): Promise<void> {
    for (const record of records) {
      // Ensure encryptionKey is Binary if it exists
      if (record.tableName === 'keystore' && record.data?.encryptionKey) {
        const keyData = record.data.encryptionKey;
        if (Array.isArray(keyData)) {
          // If it's an array (from Socket.IO deserialization), convert to Binary
          record.data.encryptionKey = new Binary(new Uint8Array(keyData));
        } else if (keyData instanceof ArrayBuffer) {
          // If it's an ArrayBuffer, convert to Binary
          record.data.encryptionKey = new Binary(new Uint8Array(keyData));
        }
      }

      // Save the replication record first
      await this.replicationModel.create({
        ...record,
        userId, // Ensure the userId is set from the authenticated user
      });
    }
  }

  /**
   * Get replication records for a user since a specific timestamp
   */
  async getReplicationsSince(
    userId: string,
    timestamp: Date,
  ): Promise<ReplicationRecord[]> {
    // Get all groups the user is part of
    const groups = await this.groupService.getGroups(userId);
    const groupIds = groups.map(group => group.id);

    // Get all replication records for these groups since the timestamp
    const records = await this.replicationModel.find({
      groupId: { $in: groupIds },
      createdAt: { $gt: timestamp },
    }).sort({ createdAt: 1 });

    console.log('getReplicationsSince records', records);
    // Convert records to plain objects and ensure ArrayBuffer is properly handled
    return records.map(record => {
      const plainRecord = record.toObject();
      if (plainRecord.tableName === 'keystore' && plainRecord.data?.encryptionKey) {
        // Convert MongoDB Binary to ArrayBuffer
        const binary = plainRecord.data.encryptionKey as Binary;
        // Convert Binary to Uint8Array and then to ArrayBuffer
        plainRecord.data.encryptionKey = new Uint8Array(binary.buffer).buffer;
      }
      return plainRecord;
    });
  }
}