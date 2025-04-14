import { ReplicationModule } from '../replication/replication.module';

export class GroupInviteService {
  private static instance: GroupInviteService;
  private replicationSocketService = ReplicationModule.getInstance().getReplicationSocketService();

  private constructor() {}

  public static getInstance(): GroupInviteService {
    if (!GroupInviteService.instance) {
      GroupInviteService.instance = new GroupInviteService();
    }
    return GroupInviteService.instance;
  }

  public async createInvite(groupId: string): Promise<string | null> {
    const response = await this.replicationSocketService.createGroupInvite(groupId);
    if (response.success && response.inviteCode) {
      return response.inviteCode;
    }
    return null;
  }

  public async useInvite(inviteCode: string): Promise<boolean> {
    const response = await this.replicationSocketService.useGroupInvite(inviteCode);
    return response.success;
  }
} 