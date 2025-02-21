import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MessageSchema } from './message.schema';
import { Expose, Transform } from 'class-transformer';
import { Field, ID } from '@nestjs/graphql';
import { Group } from './group.schema';

@Schema({ timestamps: true }) // Automatisch erstellte Felder für Erstellungs- und Aktualisierungsdatum
export class GroupKey extends Document {
  @Field(() => ID)
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() ?? obj.id?.toString())
  override id!: string;

  @Prop({ type: Types.ObjectId, ref: Group.name, required: true })
  @Field(() => ID)
  @Expose()
  @Transform(({ value }) => value?.toString())
  groupId!: Types.ObjectId;

  @Prop({ required: true, type: Buffer })
  @Expose() // Gruppen-Key als Binär speichern
  key!: Buffer;

  @Prop()
  @Expose()
  createdAt!: Date; // Automatisch gesetzt von Mongoose

  @Prop()
  @Expose()
  updatedAt!: Date; // Automatisch aktualisiert bei jeder Änderung
}

export const GroupKeySchema = SchemaFactory.createForClass(GroupKey);

MessageSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});