import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType() // ✅ GraphQL DTO
export class TokenDTO {
  @Field() // Automatisch als `String` erkannt
  userId!: string;
}