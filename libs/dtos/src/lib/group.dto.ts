import { Field, ObjectType, ID, InputType, OmitType, PickType } from '@nestjs/graphql';
import { Group } from '@gruuplr/schemas';

@ObjectType()
export class GroupDTO extends OmitType(Group, ['_id'] as const) {
  @Field(() => ID)
  override id!: string; // ✅ ID als string, nicht ObjectId
}

@InputType()
export class CreateGroupInput extends PickType(GroupDTO, ['name', 'description'] as const) {
  @Field()
  override name!: string;
  @Field()
  override description!: string;
}

@InputType()
export class UpdateGroupInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}