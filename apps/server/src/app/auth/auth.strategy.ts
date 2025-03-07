import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenDTO } from '@gruuplr/dtos';
@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') { // ✅ Definiere die Strategie explizit als "jwt"
  constructor(configService: ConfigService) {
    const jwt = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Token aus dem `Authorization`-Header
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'fallback-secret'),
    }
    super(jwt);
  }

  async validate(payload: TokenDTO) {
    console.log('payload', payload);
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    return payload; // ✅ Rückgabe der User-Daten für den Guard
  }
}