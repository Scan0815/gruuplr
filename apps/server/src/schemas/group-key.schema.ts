import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MessageSchema } from './message.schema';
import { Expose } from 'class-transformer';

@Schema({ timestamps: true }) // Automatisch erstellte Felder für Erstellungs- und Aktualisierungsdatum
export class GroupKey extends Document {
  @Prop({ required: true })
  @Expose()
  groupId!: string;

  @Prop({ required: true, type: Buffer })
  @Expose() // Gruppen-Key als Binär speichern
  key!: Buffer;

  @Prop({ required: true })
  @Expose()
  keyIndex!: number;

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