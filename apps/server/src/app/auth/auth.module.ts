import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthStrategy } from './auth.strategy';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ Erlaubt Zugriff auf `.env`
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // ✅ Aus `.env` laden
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserModule, // Add this line so UserService is available
  ],
  providers: [AuthStrategy, AuthResolver],
  exports: [JwtModule,PassportModule],
})
export class AuthModule {}