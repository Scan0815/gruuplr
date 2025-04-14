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
      throw new WsTokenException('Custom forbidden: Missing authentication token', "TOKEN_MISSING");
    }

    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.tokenType !== 'access') {
        throw new WsTokenException('Invalid token type', "TOKEN_INVALID");
      }
      
      // Write the decoded token data to client.data.user
      client.data.user = {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username
      };
      
      return true;
    } catch (error) {
      throw new WsTokenException('Custom forbidden: Invalid authentication token', "TOKEN_INVALID");
    }
  }
}