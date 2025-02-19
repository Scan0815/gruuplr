import { ObjectType, Field, ID, OmitType, InputType, PickType } from '@nestjs/graphql';
import { User } from '@gruuplr/schemas';

@ObjectType()
export class UserDTO extends OmitType(User, ['_id'] as const) {
  @Field(() => ID)
  override id!: string; // ✅ ID als string, nicht ObjectId
}

@InputType()
export class CreateUserInput extends PickType(UserDTO, ['username', 'password'] as const) {
  @Field()
  override username!: string;
  @Field()
  override password!: string;
}