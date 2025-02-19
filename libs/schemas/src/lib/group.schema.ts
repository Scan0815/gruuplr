import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';

@Schema({ timestamps: true })
@ObjectType()
export class Group extends Document {
  @Field(() => ID)
  @Expose()
  @Transform(({ obj }) => {
    return obj._id?.toString() ?? obj.id?.toString();
  })
  override id!: string;

  @Prop({ required: true, unique: true })
  @Expose()
  @Field()
  name!: string;

  @Prop({ default: '' })
  @Expose()
  @Field({ nullable: true })
  description?: string;

  // Array of user IDs (as strings) representing group members
  @Prop({ type: [String], default: [] })
  @Expose()
  @Field(() => [String], { nullable: true })
  members?: string[];

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);