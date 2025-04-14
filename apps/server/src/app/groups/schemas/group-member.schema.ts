import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupMemberDocument = GroupMember & Document;

@Schema({ timestamps: true })
export class GroupMember {
  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, default: 'member' })
  role: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember); 