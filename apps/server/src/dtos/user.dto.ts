import { ObjectType, Field, ID } from '@nestjs/graphql';
import { OmitType } from '@nestjs/graphql';
import { User } from '../schemas/user.schema';

@ObjectType()
export class UserDTO extends OmitType(User, ['_id', 'password'] as const) {
  @Field(() => ID)
  override id!: string;
}