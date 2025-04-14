import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupInviteDocument = GroupInvite & Document;

@Schema({ timestamps: true })
export class GroupInvite {
  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true, unique: true })
  inviteCode: string;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop()
  usedBy?: string;

  @Prop()
  usedAt?: Date;

  @Prop({ default: Date.now, expires: 7 * 24 * 60 * 60 }) // Expires after 7 days
  createdAt: Date;
}

export const GroupInviteSchema = SchemaFactory.createForClass(GroupInvite); 