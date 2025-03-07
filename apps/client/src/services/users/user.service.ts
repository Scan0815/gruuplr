import { LocalUserDto, UserRepository } from './user.repository';
import { UserDto } from '../../generated/graphql';

export class UserService {
  private static instance: UserService;
  private userRepo: UserRepository = new UserRepository();

  private constructor() {
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async updateUserTokens(id: string, accessToken: string, refreshToken: string): Promise<void> {
    const user = await this.userRepo.findOne({id});
    if (user) {
      await user.update({ $set: { accessToken, refreshToken } });
    }
  }

  public async switchUser(id:string): Promise<void> {
    // Deactivate all users
    const docs = await this.userRepo.find();
    for (const doc of docs) {
      if (doc.active) {
        await doc.update({ $set: { active: false } });
      }
    }
    // Activate the selected user
    const userToActivate = await this.userRepo.findOne({id});
    if (userToActivate) {
      await userToActivate.update({ $set: { active: true } });
    }
  }

  public async createUser(id:string,username: string,role:string, accessToken: string, refreshToken: string): Promise<void> {

    // Deactivate all users
    const docs = await this.userRepo.find();
    for (const doc of docs) {
      if (doc.active) {
        await doc.update({ $set: { active: false } });
      }
    }

    // Create user in the database
    await this.userRepo.upsert({
      id,
      username,
      role,
      accessToken,
      refreshToken,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async getActiveUser(): Promise<LocalUserDto|null> {
    return this.userRepo.findOne({ active: true });
  }

}