import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthResponseDTO } from '@gruuplr/dtos';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  @Mutation(() => AuthResponseDTO)
  async refreshToken(
    @Args('refreshToken') refreshToken: string
  ): Promise<AuthResponseDTO> {
    try {
      console.log('refreshToken', refreshToken);
      // Verify the refresh token; adjust options if you use a separate secret
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.userService.getUserById(payload.id);
      // Generate new tokens
      const newAccessToken = this.jwtService.sign(
        { id: user.id,
          role: user.role,
          username: user.username,
          tokenType: 'access' },
        { expiresIn: '1m' }
      );
      const newRefreshToken = this.jwtService.sign(
        { id: payload.id, tokenType: 'refresh' },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET,
        }
      );

      return { token: newAccessToken, refreshToken: newRefreshToken, user };
    } catch (error) {
      throw new BadRequestException('Refresh token is invalid or expired');
    }
  }
}
