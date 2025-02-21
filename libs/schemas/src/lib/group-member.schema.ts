// File: libs/schemas/src/lib/group-member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';

@Schema({ _id: false }) // No separate _id for subdocument
@ObjectType()
export class GroupMember {
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Field()
  @Expose()
  @Prop({ default: 'member' }) // Default role is "member"
  role!: string;
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);