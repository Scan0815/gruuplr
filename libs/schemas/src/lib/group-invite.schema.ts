import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';
import { User } from './user.schema';
import { Group } from './group.schema';

@Schema({ timestamps: true })
@ObjectType()
export class GroupInvite extends Document {
  @Field(() => ID)
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id?.toString())
  override id!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  invitedById!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  invitedUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Group.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  groupId!: Types.ObjectId;

  @Prop({ required: true })
  @Field()
  @Expose()
  status!: 'pending' | 'accepted' | 'rejected';

  @Prop({ required: true })
  @Field()
  @Expose()
  expiresAt!: Date;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

export const GroupInviteSchema = SchemaFactory.createForClass(GroupInvite); 