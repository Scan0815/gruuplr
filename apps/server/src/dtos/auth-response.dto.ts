import { ObjectType, Field } from '@nestjs/graphql';
import { UserDTO } from './user.dto';

@ObjectType()
export class AuthResponseDTO {
  @Field()
  token!: string;

  @Field(() => UserDTO)
  user!: UserDTO;
}