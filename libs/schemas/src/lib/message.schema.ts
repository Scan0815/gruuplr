import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';
import { User } from './user.schema';
import { Group } from './group.schema';


@Schema({ timestamps: true }) // ✅ Mongoose-Schema
@ObjectType() // ✅ GraphQL DTO
export class Message extends Document {
  @Field(() => ID)
  @Expose()
  override id!: string;

  @Prop({ type: Types.ObjectId, ref: User.name , required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Group.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  groupId!: Types.ObjectId;

  @Prop({ required: true, type: Buffer }) // Speichert verschlüsselte Nachricht als Binärdaten
  @Field()
  @Expose()
  @Transform(({ value }) => (value instanceof Buffer ? value.toString('base64') : value))
  encryptedMessage!: string; // Exposed as a Base64 string

  @Prop({ type: Types.ObjectId, ref: 'groupkeys', required: true })
  @Field(() => ID)
  @Expose()
  keyId!: Types.ObjectId;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});