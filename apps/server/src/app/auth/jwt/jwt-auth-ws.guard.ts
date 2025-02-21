import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsTokenException } from '../../../exceptions/WsTokenException';

@Injectable()
export class JwtAuthWsGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    // ✅ 1. Token aus dem Handshake-Query oder den Headers holen
    const token = client.handshake.auth.token as string; // Falls Token in der URL übergeben wurde
    if (!token) {
      throw new WsTokenException('Custom forbidden: Missing authentication token',"TOKEN_MISSING");
    }

    try {
      // ✅ 2. Token verifizieren
      client.data.user = this.jwtService.verify(token);
      return true;
    } catch (error) {
      throw new WsTokenException('Custom forbidden: Missing authentication token',"TOKEN_INVALID");
    }
  }
}