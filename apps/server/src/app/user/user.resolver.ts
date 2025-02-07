import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDTO } from '../../dtos/user.dto';
import { AuthResponseDTO } from '../../dtos/auth-response.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Resolver(() => UserDTO)
export class UserResolver {
  constructor(private readonly userService: UserService) {}


  // ✅ Benutzer registrieren (Mutation)
  @Mutation(() => AuthResponseDTO)
  async register(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AuthResponseDTO> {
    const user =  await this.userService.createUser(username, password);
    const token = this.userService.signUser({...user})
    return { token, user };
  }

  // ✅ Login (Mutation) -> Gibt JWT zurück
  @Mutation(() => AuthResponseDTO)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AuthResponseDTO> {
    const token = await this.userService.validateUser(username, password);
    if (!token) {
      throw new Error('Invalid credentials');
    }
    const user = await this.userService.getUserByUsername(username) as UserDTO;
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
    return user;
  }

}