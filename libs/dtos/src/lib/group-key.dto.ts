import { Field, ObjectType, ID, InputType, OmitType, PickType } from '@nestjs/graphql';
import { GroupKey } from '@gruuplr/schemas';
@ObjectType()
export class GroupKeyDTO extends OmitType(GroupKey, ['_id'] as const) {
  @Field(() => ID)
  override id!: string; // ✅ ID als string, nicht ObjectId
}

@InputType()
export class CreateGroupKeyInput extends PickType(GroupKeyDTO, ['groupId', 'key'] as const) {
  @Field(() => ID)
  override groupId!: string; // ✅ ID als string, nicht ObjectId
  @Field()
  override key!: string;
}