import { ObjectType, Field, ID, InputType, PickType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class GroupMemberDTO {
  @Field(() => ID)
  @Expose()
  id!: string;

  @Field(() => ID)
  @Expose()
  userId!: string;

  @Field(() => ID)
  @Expose()
  groupId!: string;

  @Field()
  @Expose()
  role!: 'admin' | 'member';

  @Field()
  @Expose()
  isActive!: boolean;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

@InputType()
export class CreateGroupMemberInput extends PickType(GroupMemberDTO, ['userId', 'groupId', 'role'] as const) {
  @Field(() => ID)
  override userId!: string;

  @Field(() => ID)
  override groupId!: string;

  @Field()
  override role!: 'admin' | 'member';
}

@InputType()
export class UpdateGroupMemberInput extends PickType(GroupMemberDTO, ['role', 'isActive'] as const) {
  @Field()
  override role!: 'admin' | 'member';

  @Field()
  override isActive!: boolean;
} 