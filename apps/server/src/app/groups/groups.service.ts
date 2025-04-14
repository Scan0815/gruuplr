import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from '@gruuplr/schemas';
import { GroupMember } from '@gruuplr/schemas';
import { GroupInvite } from '@gruuplr/schemas';
import { CreateGroupInput, GroupDTO } from '@gruuplr/dtos';
import { CreateGroupMemberInput, GroupMemberDTO, UpdateGroupMemberInput } from '@gruuplr/dtos';
import { CreateGroupInviteInput, GroupInviteDTO, UpdateGroupInviteInput } from '@gruuplr/dtos';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(GroupMember.name) private groupMemberModel: Model<GroupMember>,
    @InjectModel(GroupInvite.name) private groupInviteModel: Model<GroupInvite>,
  ) {}

  async createGroup(userId: string, input: CreateGroupInput): Promise<GroupDTO> {
    const group = new this.groupModel(input);
    const savedGroup = await group.save();

    // Create group member entry for the creator as admin
    const memberInput: CreateGroupMemberInput = {
      userId,
      groupId: savedGroup.id,
      role: 'admin',
    };
    await this.createGroupMember(memberInput);

    return plainToInstance(GroupDTO, savedGroup, { excludeExtraneousValues: true });
  }

  async getGroups(userId: string): Promise<GroupDTO[]> {
    const memberGroups = await this.groupMemberModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .populate('groupId')
      .exec();

    const groups = memberGroups.map(member => member.groupId);
    return groups.map(group => plainToInstance(GroupDTO, group, { excludeExtraneousValues: true }));
  }

  async getGroupById(userId: string, groupId: string): Promise<GroupDTO> {
    const member = await this.groupMemberModel
      .findOne({ 
        userId: new Types.ObjectId(userId), 
        groupId: new Types.ObjectId(groupId),
        isActive: true 
      })
      .populate('groupId')
      .exec();

    if (!member) {
      throw new NotFoundException('Group not found or user is not a member');
    }

    return plainToInstance(GroupDTO, member.groupId, { excludeExtraneousValues: true });
  }

  async createGroupMember(input: CreateGroupMemberInput): Promise<GroupMemberDTO> {
    const member = new this.groupMemberModel(input);
    const savedMember = await member.save();
    return plainToInstance(GroupMemberDTO, savedMember, { excludeExtraneousValues: true });
  }

  async updateGroupMember(
    userId: string,
    groupId: string,
    memberId: string,
    input: UpdateGroupMemberInput
  ): Promise<GroupMemberDTO> {
    // Check if the user is an admin of the group
    const adminMember = await this.groupMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      groupId: new Types.ObjectId(groupId),
      role: 'admin',
      isActive: true,
    });

    if (!adminMember) {
      throw new ForbiddenException('Only group admins can update member roles');
    }

    const updatedMember = await this.groupMemberModel
      .findByIdAndUpdate(memberId, input, { new: true })
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Group member not found');
    }

    return plainToInstance(GroupMemberDTO, updatedMember, { excludeExtraneousValues: true });
  }

  async createGroupInvite(userId: string, input: CreateGroupInviteInput): Promise<GroupInviteDTO> {
    // Check if the user is a member of the group
    const member = await this.groupMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      groupId: new Types.ObjectId(input.groupId),
      isActive: true,
    });

    if (!member) {
      throw new ForbiddenException('Only group members can invite users');
    }

    // Check if invite already exists
    const existingInvite = await this.groupInviteModel.findOne({
      invitedUserId: new Types.ObjectId(input.invitedUserId),
      groupId: new Types.ObjectId(input.groupId),
      status: 'pending',
    });

    if (existingInvite) {
      throw new BadRequestException('Invite already exists');
    }

    const invite = new this.groupInviteModel({
      ...input,
      invitedById: userId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedInvite = await invite.save();
    return plainToInstance(GroupInviteDTO, savedInvite, { excludeExtraneousValues: true });
  }

  async updateGroupInvite(
    userId: string,
    inviteId: string,
    input: UpdateGroupInviteInput
  ): Promise<GroupInviteDTO> {
    const invite = await this.groupInviteModel
      .findOne({
        _id: new Types.ObjectId(inviteId),
        invitedUserId: new Types.ObjectId(userId),
        status: 'pending',
      })
      .exec();

    if (!invite) {
      throw new NotFoundException('Invite not found or already processed');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    invite.status = input.status;
    const savedInvite = await invite.save();

    if (input.status === 'accepted') {
      await this.createGroupMember({
        userId,
        groupId: invite.groupId.toString(),
        role: 'member',
      });
    }

    return plainToInstance(GroupInviteDTO, savedInvite, { excludeExtraneousValues: true });
  }

  async getGroupInvites(userId: string): Promise<GroupInviteDTO[]> {
    const invites = await this.groupInviteModel
      .find({
        invitedUserId: new Types.ObjectId(userId),
        status: 'pending',
        expiresAt: { $gt: new Date() },
      })
      .populate('groupId')
      .exec();

    return invites.map(invite => plainToInstance(GroupInviteDTO, invite, { excludeExtraneousValues: true }));
  }

  async getGroupMembers(groupId: string): Promise<GroupMemberDTO[]> {
    const members = await this.groupMemberModel
      .find({ groupId: new Types.ObjectId(groupId), isActive: true })
      .populate('userId')
      .exec();

    return members.map(member => plainToInstance(GroupMemberDTO, member, { excludeExtraneousValues: true }));
  }

  async createInvite(groupId: string, invitedUserId:string, userId: string): Promise<{ inviteCode: string }> {
    // Check if user is a member of the group
    const member = await this.groupMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      groupId: new Types.ObjectId(groupId),
      role: 'admin',
      isActive: true,
    });

    if (!member) {
      throw new ForbiddenException('Only group admins can create invites');
    }

    // Create a new invite
    const invite = await this.createGroupInvite(userId,{
      invitedUserId, // Temporary - will be updated when used
      groupId,
    });

    return { inviteCode: invite.id }; // Using the invite ID as the invite code
  }

  async useInvite(inviteCode: string, userId: string): Promise<boolean> {
    const invite = await this.groupInviteModel.findById(inviteCode).exec();

    if (!invite || invite.status !== 'pending' || invite.expiresAt < new Date()) {
      return false;
    }

    // Update the invite directly since we're accepting it with a new user
    invite.invitedUserId = new Types.ObjectId(userId);
    invite.status = 'accepted';
    await invite.save();

    // Create group membership for the user
    await this.createGroupMember({
      userId,
      groupId: invite.groupId.toString(),
      role: 'member',
    });

    return true;
  }
} 