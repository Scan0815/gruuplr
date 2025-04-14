// File: libs/schemas/src/lib/group-member.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';
import { User } from './user.schema';
import { Group } from './group.schema';

@Schema({ timestamps: true })
@ObjectType()
export class GroupMember extends Document {
  @Field(() => ID)
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id?.toString())
  override id!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Group.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  groupId!: Types.ObjectId;

  @Prop({ required: true, default: 'member' })
  @Field()
  @Expose()
  role!: 'admin' | 'member';

  @Prop({ required: true, default: true })
  @Field()
  @Expose()
  isActive!: boolean;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);