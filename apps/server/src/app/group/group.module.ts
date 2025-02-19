import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupResolver } from './group.resolver';
import { GroupService } from './group.service';
import { Group, GroupSchema } from '@gruuplr/schemas';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
  ],
  providers: [GroupResolver, GroupService],
  exports: [MongooseModule,GroupService],
})
export class GroupModule {}