import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthResponseDTO, CreateGroupInput, CreateUserInput, UserDTO } from '@gruuplr/dtos';

@Resolver(() => UserDTO)
export class UserResolver {
  constructor(private readonly userService: UserService) {}


  // ✅ Benutzer registrieren (Mutation)
  @Mutation(() => AuthResponseDTO)
  async register(
    @Args('input') input: CreateUserInput,
  ): Promise<AuthResponseDTO> {
    const user =  await this.userService.createUser(input);
    const token = this.userService.signUser({...user})
    return { token, user };
  }

  // ✅ Login (Mutation) -> Gibt JWT zurück
  @Mutation(() => AuthResponseDTO)
  async login(
    @Args('input') input: CreateUserInput,
  ): Promise<AuthResponseDTO> {
    const token = await this.userService.validateUser(input.username,input.password) as string;
    if (!token) {
      throw new Error('Invalid credentials');
    }
    const user = await this.userService.getUserByUsername(input.username) as UserDTO;
    return { token, user };
  }

  // ✅ Benutzer abrufen (Query)
  @Query(() => UserDTO)
  async getUser(@Args('id') id: string): Promise<UserDTO> {
    return this.userService.getUserById(id);
  }

  @Query(() => UserDTO)
  @UseGuards(JwtAuthGuard) // ✅ Nur authentifizierte User können zugreifen
  async me(@CurrentUser() user: UserDTO) {
    // ✅ `createdAt` und `updatedAt` in `Date`-Objekte umwandeln
    user.createdAt = new Date(user.createdAt);
    user.updatedAt = new Date(user.updatedAt);
    console.log('me', user);
    return user;
  }

}