import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';


@Schema({ timestamps: true }) // ✅ Mongoose-Schema
@ObjectType() // ✅ GraphQL DTO
export class Message extends Document {
  @Field(() => ID)
  @Expose()
  override id!: string;

  @Prop({ required: true })
  @Field()
  @Expose()
  groupId!: string;

  @Prop({ required: true, type: Buffer }) // Speichert verschlüsselte Nachricht als Binärdaten
  @Field()
  @Expose()
  encryptedMessage!: string; // Wird Base64-kodiert für GraphQL transportiert

  @Prop({ required: true })
  @Field()
  @Expose()
  keyIndex!: number;

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