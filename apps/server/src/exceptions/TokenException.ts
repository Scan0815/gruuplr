import { HttpException } from '@nestjs/common';

export class TokenException extends HttpException {
  constructor(message: string, code: string) {
    super({ message, code }, 403);
  }
}