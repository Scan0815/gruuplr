import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupInput, GroupDTO, GroupMemberDTO, UpdateGroupInput } from '@gruuplr/dtos';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CurrentUser } from '../user/current-user.decorator';
import { UserDTO } from '@gruuplr/dtos';

@Resolver(() => GroupDTO)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @Mutation(() => GroupDTO)
  @UseGuards(JwtAuthGuard)
  async createGroup(
    @CurrentUser() user: UserDTO,
    @Args('input') input: CreateGroupInput
  ): Promise<GroupDTO> {
    return this.groupsService.createGroup(user.id, input);
  }

  @Mutation(() => GroupDTO)
  @UseGuards(JwtAuthGuard)
  async updateGroup(
    @CurrentUser() user: UserDTO,
    @Args('input') input: UpdateGroupInput
  ): Promise<GroupDTO> {
    return this.groupsService.updateGroup(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteGroup(
    @CurrentUser() user: UserDTO,
    @Args('id') id: string
  ): Promise<boolean> {
    return this.groupsService.deleteGroup(user.id, id);
  }

  @Query(() => [GroupDTO])
  @UseGuards(JwtAuthGuard)
  async getGroups(@CurrentUser() user: UserDTO): Promise<GroupDTO[]> {
    return this.groupsService.getGroups(user.id);
  }

  @Query(() => GroupDTO)
  @UseGuards(JwtAuthGuard)
  async getGroupById(
    @CurrentUser() user: UserDTO,
    @Args('id') id: string
  ): Promise<GroupDTO> {
    return this.groupsService.getGroupById(user.id, id);
  }

  @Query(() => [GroupMemberDTO])
  @UseGuards(JwtAuthGuard)
  async getGroupMembers(
    @Args('groupId') groupId: string
  ): Promise<GroupMemberDTO[]> {
    return this.groupsService.getGroupMembers(groupId);
  }
} 