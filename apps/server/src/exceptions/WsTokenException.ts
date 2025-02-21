import { WsException } from '@nestjs/websockets';

export class WsTokenException extends WsException {
  constructor(error: string, public readonly code: string) {
    super({error,code});
  }
}