import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenException } from '../../../exceptions/TokenException';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override getRequest(context: ExecutionContext) {
    // ✅ Falls GraphQL, extrahiere `req` aus `context`
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  override handleRequest(err:any, user:any) {
    if (err || !user) {
      throw new TokenException('Invalid or expired token',"TOKEN_INVALID");
    }
    return user;
  }
}