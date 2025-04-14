import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Group } from './group.schema';

@Schema({ timestamps: true }) // Automatisch erstellte Felder für Erstellungs- und Aktualisierungsdatum
@ObjectType() // GraphQL-Datenübertragungsobjekt
export class GroupKey extends Document {
  @Field(() => ID)
  @Expose()
  override id!: string;

  @Prop({
    type: Types.ObjectId,
    ref: Group.name,
    required: true,
  })
  @Field(() => ID)
  @Expose()
  groupId!: string;

  @Prop({ required: true, type: Buffer })
  @Field(() => String, { description: 'Base64-encoded group key' })
  @Expose() // Gruppen-Key als Binär speichern
  @Transform(({ value }) => {
    console.log('Transforming value:', value);
    if (!value) return null;


    // Check if value is an instance of Buffer.
    if (Buffer.isBuffer(value)) {
      return value.toString('base64');
    }
    // Otherwise, if value is an object with { type: 'Buffer', data: [...] }
    if (typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
      return Buffer.from(value.data).toString('base64');
    }
    return value;
  })
  key!: string;

  @Prop()
  @Field()
  @Expose()
  createdAt!: Date; // Automatisch gesetzt von Mongoose

  @Prop()
  @Field()
  @Expose()
  updatedAt!: Date; // Automatisch aktualisiert bei jeder Änderung
}

export const GroupKeySchema = SchemaFactory.createForClass(GroupKey);