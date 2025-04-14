import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReplicationRecordDocument = ReplicationRecord & Document;

@Schema({ timestamps: true })
export class ReplicationRecord {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  groupId!: string;

  @Prop({ required: true })
  tableName!: 'groups' | 'keystore' | 'messages';

  @Prop({ required: true })
  operation!: 'add' | 'put' | 'delete';

  @Prop({ type: Object, required: true })
  data!: any;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const ReplicationRecordSchema = SchemaFactory.createForClass(ReplicationRecord);

// Create indexes for efficient querying
ReplicationRecordSchema.index({ groupId: 1, createdAt: 1 });
ReplicationRecordSchema.index({ userId: 1, createdAt: 1 }); 