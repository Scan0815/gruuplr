import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserDTO } from '@gruuplr/dtos';
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

  async validate(payload: UserDTO) {
    return payload; // ✅ Rückgabe der User-Daten für den Guard
  }
}