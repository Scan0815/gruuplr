import { request } from 'graphql-request';
import { AccountService } from '../features/account/account.service';
import { DocumentNode } from 'graphql/language';
import type { Variables } from 'graphql-request/src/legacy/helpers/types';
import { AccountGraphQL } from '../features/account/account.graphql';
import { Mutation } from '../generated/graphql';

export class GraphQLService {
  private static instance: GraphQLService;
  private refreshPromise: Promise<Mutation["refreshToken"]>|null = null;

  private constructor() {}

  public static getInstance(): GraphQLService {
    if (!GraphQLService.instance) {
      GraphQLService.instance = new GraphQLService();
    }
    return GraphQLService.instance;
  }

  /**
   * Ensures that if a token refresh is already in progress, we wait for it to complete.
   */
  private async waitForTokenRefresh(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = AccountGraphQL.refreshToken(AccountService.getInstance().getRefreshToken() as string);
      try {
        await this.refreshPromise;
      } finally {
        this.refreshPromise = null;
      }
    } else {
      await this.refreshPromise;
    }
  }

  /**
   * Sends a GraphQL request with error handling and a single retry if the token is expired.
   *
   * @param url GraphQL endpoint URL
   * @param query GraphQL query or mutation DocumentNode
   * @param variables Variables to send with the request
   * @param additionalHeaders Optional additional headers
   * @param retryCount Internal counter to avoid infinite loops (default: 0)
   */
  async request<T, V extends Variables = Variables>(
    url: string,
    query: DocumentNode,
    variables?: V,
    additionalHeaders?: Record<string, string>,
    retryCount: number = 0
  ): Promise<T> {
    let token = AccountService.getInstance().getToken();
    const headers = token
      ? { Authorization: `Bearer ${token}`, ...(additionalHeaders || {}) }
      : { ...(additionalHeaders || {}) };

    try {
      return await request<T>(url, query, variables, headers);
    } catch (error: any) {
      // Check if error has GraphQL errors in the response.
      if (
        error.response &&
        error.response.errors &&
        error.response.errors.length > 0
      ) {
        const firstError = error.response.errors[0];
        const code = firstError.extensions?.code;
        if (code === 'TOKEN_INVALID' && retryCount < 1) {
          console.log('Token invalid: attempting token refresh.');
          // Wait for token refresh.
          await this.waitForTokenRefresh();
          const newToken = AccountService.getInstance().getToken();
          // If token remains unchanged, don't retry indefinitely.
          if (!newToken || newToken === token) {
            throw new Error('Token refresh failed or returned the same token.');
          }
          console.log('New token acquired, retrying request...');

          // Update the token in the chat socket service
          //SocketService.getInstance(newToken as string).updateToken(newToken as string);

          // Retry the request with the new token, incrementing the retry count.
          return this.request<T, V>(
            url,
            query,
            variables,
            additionalHeaders,
            retryCount + 1
          );
        }
      }
      throw error;
    }
  }
}
