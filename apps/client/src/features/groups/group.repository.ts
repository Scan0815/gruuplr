import { Table } from 'dexie';
import { Group } from './group.model';
import { AppDatabase } from '../../db/AppDatabase';

export class GroupRepository {
  private table: Table<Group, string>;

  constructor(db: AppDatabase) {
    this.table = db.groups;
  }

  async create(group: Group): Promise<string> {
    await this.table.add(group);
    return group.id;
  }

  async getById(groupId: string): Promise<Group | undefined> {
    return this.table.get(groupId);
  }

  async update(groupId: string, changes: Partial<Group>): Promise<number> {
    const updated = await this.table.update(groupId, changes);
    if (!updated) {
      throw new Error(`Group with id ${groupId} not found or update failed.`);
    }
    return updated;
  }

  async delete(groupId: string): Promise<void> {
    await this.table.delete(groupId);
  }

  async getAll(userId: string): Promise<Group[]> {
    return this.table
      .where('memberIds')
      .equals(userId)
      .filter((group) => !group.deletedAt)
      .reverse()
      .sortBy('createdAt');
  }
}
