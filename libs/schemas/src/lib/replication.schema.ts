import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReplicationDocument = Replication & Document;

@Schema({ timestamps: true })
export class Replication {
  @Prop({ type: String, required: true })
  tableName: string;

  @Prop({ type: String, required: true, enum: ['add', 'put', 'delete'] })
  operation: string;

  @Prop({ type: Object, required: true })
  data: any;

  @Prop({ type: Number, required: true })
  timestamp: number;
}

export const ReplicationSchema = SchemaFactory.createForClass(Replication);