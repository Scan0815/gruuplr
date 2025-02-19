import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGroupInput, GroupDTO } from '@gruuplr/dtos';
import { plainToInstance } from 'class-transformer';
import { Group } from '@gruuplr/schemas';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel('Group') private groupModel: Model<Group>
  ) {}

  async createGroup(input: CreateGroupInput): Promise<GroupDTO> {
    const createdGroup = new this.groupModel(input);
    const savedGroup: Group = await createdGroup.save();
    return plainToInstance(GroupDTO, savedGroup, {
      excludeExtraneousValues: true,
    });
  }

  async getGroups(): Promise<GroupDTO[]> {
    const groups = await this.groupModel.find().exec();
    return groups.map((g) =>
      plainToInstance(GroupDTO, g, { excludeExtraneousValues: true })
    );
  }

  async joinGroup(groupId: string, userId: string): Promise<GroupDTO> {
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    // Ensure members array is defined
    if (!group.members) {
      group.members = [];
    }
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    return plainToInstance(GroupDTO, group, { excludeExtraneousValues: true });
  }
}
