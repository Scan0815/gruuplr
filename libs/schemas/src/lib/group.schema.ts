// File: libs/schemas/src/lib/group.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';
import { GroupMember, GroupMemberSchema } from './group-member.schema';

@Schema({ timestamps: true })
@ObjectType()
export class Group extends Document {
  @Field(() => ID)
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id?.toString())
  override id!: string;

  @Prop({ required: true, unique: true })
  @Expose()
  @Field()
  name!: string;

  @Prop({ default: '' })
  @Expose()
  @Field({ nullable: true })
  description?: string;

  // Members stored as an array of GroupMember subdocuments.
  @Prop({ type: [GroupMemberSchema], default: [] })
  @Expose()
  @Field(() => [GroupMember], { nullable: true })
  members!: GroupMember[];

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);