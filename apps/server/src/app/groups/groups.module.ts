import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupsResolver } from './groups.resolver';
import { Group, GroupSchema } from '@gruuplr/schemas';
import { GroupMember, GroupMemberSchema } from '@gruuplr/schemas';
import { GroupInvite, GroupInviteSchema } from '@gruuplr/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupMember.name, schema: GroupMemberSchema },
      { name: GroupInvite.name, schema: GroupInviteSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService],
})
export class GroupsModule {} 