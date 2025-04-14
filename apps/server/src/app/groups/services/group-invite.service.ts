import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupInvite, GroupInviteDocument } from '../schemas/group-invite.schema';
import { GroupService } from './group.service';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupInviteService {
  constructor(
    @InjectModel(GroupInvite.name) private groupInviteModel: Model<GroupInviteDocument>,
    private groupService: GroupService,
  ) {}

  async createInvite(groupId: string, createdBy: string): Promise<GroupInvite> {
    const inviteCode = this.generateInviteCode();
    const invite = new this.groupInviteModel({
      groupId,
      createdBy,
      inviteCode,
    });
    return invite.save();
  }

  async useInvite(inviteCode: string, userId: string): Promise<boolean> {
    const invite = await this.groupInviteModel.findOne({ inviteCode, isUsed: false });
    
    if (!invite) {
      return false;
    }

    // Add user to group
    await this.groupService.addUserToGroup(invite.groupId, userId);

    // Mark invite as used
    invite.isUsed = true;
    invite.usedBy = userId;
    invite.usedAt = new Date();
    await invite.save();

    return true;
  }

  private generateInviteCode(): string {
    return randomBytes(8).toString('hex');
  }
} 