import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Message } from '@gruuplr/schemas';
import { OmitType } from '@nestjs/graphql';

@ObjectType()
export class MessageDTO extends OmitType(Message, ['_id'] as const) {
  // ✅ DTO aus Schema generieren
  @Field(() => ID)
  override id!: string;
}