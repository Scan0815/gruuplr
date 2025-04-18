import { ObjectType, Field, ID, InputType, PickType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class GroupInviteDTO {
  @Field(() => ID)
  @Expose()
  id!: string;

  @Field(() => ID)
  @Expose()
  invitedById!: string;

  @Field(() => ID)
  @Expose()
  invitedUserId!: string;

  @Field(() => ID)
  @Expose()
  groupId!: string;

  @Field()
  @Expose()
  status!: 'pending' | 'accepted' | 'rejected';

  @Field()
  @Expose()
  expiresAt!: Date;

  @Field()
  @Expose()
  createdAt!: Date;

  @Field()
  @Expose()
  updatedAt!: Date;
}

@InputType()
export class CreateGroupInviteInput extends PickType(GroupInviteDTO, ['groupId'] as const) {
  @Field(() => ID)
  override groupId!: string;
}

@InputType()
export class UpdateGroupInviteInput extends PickType(GroupInviteDTO, ['status'] as const) {
  @Field()
  override status!: 'pending' | 'accepted' | 'rejected';
} 