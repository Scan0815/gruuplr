import { UserRepository } from './user.repository';
import { User } from './user.model';
import { db } from '../../db/AppDatabase';

export class UserService {
  private repository: UserRepository;
  constructor(repository?: UserRepository) {
    this.repository = repository || new UserRepository(db);
  }

  async createOrUpdateUser(user:User){
    console.log("createOrUpdateUser",user);
    const now = Date.now();
    const userExists = await this.repository.getById(user.id);
      if(userExists){
        await this.repository.update(user.id, Object.assign(user,{updatedAt: now}));
      }else{
        await this.repository.create(Object.assign(user,{createdAt: now, updatedAt: now}));
      }
  }

  async findUserById(id: string): Promise<User | undefined> {
    return await this.repository.getById(id);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<number> {
    const now = Date.now();
    return await this.repository.update(id, Object.assign(updateData,{updatedAt: now}));
  }

  async removeUser(id: string): Promise<void> {
    return await this.repository.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return await this.repository.getAll();
  }

  async activateUser(userId: string): Promise<void> {
    // Run a transaction on the users table.
    await db.transaction('rw', db.users, async () => {
      // Deactivate all accounts except the one to be activated.
      await db.users
        .where('id')
        .notEqual(userId)
        .modify({ active: 0 });

      // Activate the specified account.
      await db.users.update(userId, { active: 1 });
    });
  }

  /**
   * Returns the active account (i.e. user with active === true) from IndexedDB.
   */
  async getActiveAccount(): Promise<User | undefined> {
    return await this.repository.getActive();
  }

}