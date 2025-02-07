import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthWsGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    // ✅ 1. Token aus dem Handshake-Query oder den Headers holen
    const token =
      client.handshake.headers.authorization?.split(' ')[1] || // Falls Token im Header ist
      client.handshake.query.token as string; // Falls Token in der URL übergeben wurde

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // ✅ 2. Token verifizieren
      client.data.user = this.jwtService.verify(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}