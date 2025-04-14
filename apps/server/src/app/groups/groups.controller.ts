import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupInput, GroupDTO } from '@gruuplr/dtos';
import { CreateGroupMemberInput, GroupMemberDTO, UpdateGroupMemberInput } from '@gruuplr/dtos';
import { CreateGroupInviteInput, GroupInviteDTO, UpdateGroupInviteInput } from '@gruuplr/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async createGroup(@Request() req : any, @Body() input: CreateGroupInput): Promise<GroupDTO> {
    return this.groupsService.createGroup(req.user.id, input);
  }

  @Get()
  async getGroups(@Request() req :any): Promise<GroupDTO[]> {
    return this.groupsService.getGroups(req.user.id);
  }

  @Get(':id')
  async getGroupById(@Request() req:any, @Param('id') id: string): Promise<GroupDTO> {
    return this.groupsService.getGroupById(req.user.id, id);
  }

  @Post(':groupId/members')
  async createGroupMember(
    @Request() req : any,
    @Param('groupId') groupId: string,
    @Body() input: CreateGroupMemberInput
  ): Promise<GroupMemberDTO> {
    return this.groupsService.createGroupMember(input);
  }

  @Put(':groupId/members/:memberId')
  async updateGroupMember(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Body() input: UpdateGroupMemberInput
  ): Promise<GroupMemberDTO> {
    return this.groupsService.updateGroupMember(req.user.id, groupId, memberId, input);
  }

  @Get(':groupId/members')
  async getGroupMembers(@Param('groupId') groupId: string): Promise<GroupMemberDTO[]> {
    return this.groupsService.getGroupMembers(groupId);
  }

  @Post('invites')
  async createGroupInvite(
    @Request() req :any,
    @Body() input: CreateGroupInviteInput
  ): Promise<GroupInviteDTO> {
    return this.groupsService.createGroupInvite(req.user.id, input);
  }

  @Put('invites/:id')
  async updateGroupInvite(
    @Request() req:any,
    @Param('id') id: string,
    @Body() input: UpdateGroupInviteInput
  ): Promise<GroupInviteDTO> {
    return this.groupsService.updateGroupInvite(req.user.id, id, input);
  }

  @Get('invites/pending')
  async getGroupInvites(@Request() req:any): Promise<GroupInviteDTO[]> {
    return this.groupsService.getGroupInvites(req.user.id);
  }
} 