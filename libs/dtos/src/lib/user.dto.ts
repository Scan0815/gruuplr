import { ObjectType, Field, ID, OmitType } from '@nestjs/graphql';
import { User } from '@gruuplr/schemas';

@ObjectType()
export class UserDTO extends OmitType(User, ['_id'] as const) {
  @Field(() => ID)
  override id!: string; // ✅ ID als string, nicht ObjectId
}