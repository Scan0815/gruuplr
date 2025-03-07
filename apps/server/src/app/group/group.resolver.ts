import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GroupDTO, CreateGroupInput } from '@gruuplr/dtos';
import { GroupService } from './group.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CurrentUser } from '../user/current-user.decorator';
import { UserDTO } from '@gruuplr/dtos';

@Resolver(() => GroupDTO)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation(() => GroupDTO)
  @UseGuards(JwtAuthGuard)
  async createGroup(
    @CurrentUser() user: UserDTO,
    @Args('input') input: CreateGroupInput,
  ): Promise<GroupDTO> {
    return this.groupService.createGroup(input,user.id);
  }

  @Query(() => [GroupDTO])
  @UseGuards(JwtAuthGuard)
  async getGroupsForUser(
    @CurrentUser() user: UserDTO,
  ): Promise<GroupDTO[]> {
    return this.groupService.getGroupsForUser(user.id);
  }
}