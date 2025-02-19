import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { hashPassword } from '@gruuplr/utilities';
import { Expose, Transform } from 'class-transformer';

@Schema({ timestamps: true }) // ✅ Mongoose Schema
@ObjectType() // ✅ GraphQL ObjectType für DTO-Kompatibilität
export class User extends Document {
  @Field(() => ID)
  @Expose()
  @Transform(({ obj }) => {
    return obj._id?.toString() ?? obj.id?.toString();
  }) // ✅ Falls `_id` existiert, in `id` umwandeln
  override id!: string;

  @Field()
  @Prop({ required: true, unique: true })
  @Expose()
  username!: string;

  @Prop({ required: true })
  @Expose()
  password!: string; // ✅ Nicht als GraphQL-Feld, da es sensibel ist

  @Prop({ default: 'user' })
  @Expose()
  @Field()
  role!: string;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
// ✅ Hash Passwort vor dem Speichern
UserSchema.pre('save', async function (next) {
  const user = this as User;
  if (!user.isModified('password')) return next();
  user.password = await hashPassword(user.password);
  next();
});