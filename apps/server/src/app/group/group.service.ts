import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupDTO, CreateGroupInput } from '@gruuplr/dtos';
import { Group } from '@gruuplr/schemas';

@Injectable()
export class GroupService {
  constructor(@InjectModel('Group') private groupModel: Model<Group>) {}

  async createGroup(input: CreateGroupInput, userId: string): Promise<GroupDTO> {
    // Create a new group document using input
    const createdGroup = new this.groupModel(input);
    // Add the creator as an admin member
    createdGroup.members = [{ userId: new Types.ObjectId(userId), role: 'admin' }];
    return await createdGroup.save();
  }

  async getGroupsForUser(userId: string): Promise<GroupDTO[]> {
   return await this.groupModel.find({ 'members.userId': userId }).exec();
  }

  async getGroups(): Promise<GroupDTO[]> {
    return await this.groupModel.find().exec();
  }
}
