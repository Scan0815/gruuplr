import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override getRequest(context: ExecutionContext) {
    // ✅ Falls GraphQL, extrahiere `req` aus `context`
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  override handleRequest(err:any, user:any) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}