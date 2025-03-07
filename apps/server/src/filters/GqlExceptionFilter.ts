import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { Catch, HttpException } from '@nestjs/common';
import { GraphQLError } from 'graphql/error';

@Catch(HttpException)
export class ExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: GqlArgumentsHost) {
    // The getResponse() method returns the object we passed to the exception (including message and code)
    // Return our custom error object directly
    const response = exception.getResponse() as { message: string; code: string };
    return new GraphQLError(response.message, {
      extensions: { code: response.code },
    });
  }
}