import { WsException } from '@nestjs/websockets';

export class WsGroupException extends WsException {
  constructor(error: string, public readonly code: string) {
    super({error,code});
  }
}