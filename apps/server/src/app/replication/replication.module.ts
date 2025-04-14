import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Replication, ReplicationSchema } from '@gruuplr/schemas';
import { ReplicationService } from './replication.service';
import { ReplicationGateway } from './replication.gateway';
import { AuthModule } from '../auth/auth.module';
import { ReplicationRecord, ReplicationRecordSchema } from './schemas/replication-record.schema';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    // Import the replication schema with MongooseModule
    MongooseModule.forFeature([{ name: Replication.name, schema: ReplicationSchema }]),
    MongooseModule.forFeature([
      { name: ReplicationRecord.name, schema: ReplicationRecordSchema },
    ]),
    GroupsModule,
  ],
  providers: [
    ReplicationService,
    ReplicationGateway,
  ],
  exports: [
    ReplicationService,
  ],
})
export class ReplicationModule {}