import { liveQuery, Table, Observable } from 'dexie';
import { User } from './user.model';
import { AppDatabase } from '../../db/AppDatabase';

export class UserRepository {
  private readonly table: Table<User, string>;

  constructor(db: AppDatabase) {
    this.table = db.users;
  }

  liveQuery(): Observable<User[]> {
    return liveQuery(() => this.table.toArray()) as Observable<User[]>;
  }

  async create(newUser: User): Promise<void> {
    await this.table.add(newUser);
  }

  async getById(id: string): Promise<User | undefined> {
    console.log("table",this.table);
    return this.table.get(id);
  }

  async update(id: string, changes: Partial<User>): Promise<number> {
    const updated = await this.table.update(id, changes);
    if (!updated) {
      throw new Error(`User with id ${id} not found or update failed.`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.table.delete(id);
  }

  async getAll(): Promise<User[]> {
    return this.table.toArray();
  }
  // New method: Retrieves the first active user from IndexedDB.
  async getActive(): Promise<User | undefined> {
    return this.table.where('active').equals(1).first();
  }

}