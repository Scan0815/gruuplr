import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Group, GroupMember } from '@gruuplr/schemas';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group & Document>,
    @InjectModel(GroupMember.name) private groupMemberModel: Model<GroupMember & Document>,
  ) {}

  async getGroups(): Promise<Group[]> {
    return this.groupModel.find().exec();
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const groupMembers = await this.groupMemberModel.find({ userId }).exec();
    const groupIds = groupMembers.map(member => member.groupId);
    return this.groupModel.find({ _id: { $in: groupIds } }).exec();
  }

  async addUserToGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    const groupMember = await this.groupMemberModel.find({ groupId, userId });

    if (!group) {
      throw new Error('Group not found');
    }

    if(!groupMember) {
      const newGroupMember = new this.groupMemberModel({ groupId, userId, role: 'member' });
      await newGroupMember.save();
    }

    return group;
  }

  async getGroupById(id: string): Promise<Group | null> {
    return this.groupModel.findById(id);
  }

  async createGroup(groupData: Partial<Group>): Promise<Group> {
    const group = new this.groupModel(groupData);
    return group.save();
  }

  async updateGroup(id: string, groupData: Partial<Group>): Promise<Group | null> {
    return this.groupModel.findByIdAndUpdate(id, groupData, { new: true });
  }

  async deleteGroup(id: string): Promise<boolean> {
    const result = await this.groupModel.findByIdAndDelete(id);
    return !!result;
  }
} 