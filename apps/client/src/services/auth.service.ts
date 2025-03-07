import { gql } from 'graphql-tag';
import { AccountService } from './account.service';
import { GraphQLService } from './graphql/graphql.service';
import { Mutation, MutationRefreshTokenArgs } from '../generated/graphql';
import { RouterNavigate } from '../utilities/RouterNavigate';

export class AuthService {
  private static instance: AuthService;
  private graphQLService: GraphQLService = GraphQLService.getInstance();
  private accountService: AccountService = AccountService.getInstance();
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }


  public async refreshAccessToken(): Promise<void> {
    const REFRESH_TOKEN_MUTATION = gql`
        mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
                token
                refreshToken
                user {
                    id
                    username
                }
            }
        }
    `;

    const refreshToken = this.accountService.getRefreshToken();

    if(!refreshToken) {
      console.log("no refresh token");
      this.accountService.clearTokens();
      await RouterNavigate('/login',"back");
      return;
    }

    try {
      const response = await this.graphQLService.request<Mutation, MutationRefreshTokenArgs>(
        'http://localhost:3000/graphql',
        REFRESH_TOKEN_MUTATION,
        { refreshToken }
      );
      // Assuming response.refreshToken returns an object of shape:
      // { token: string, refreshToken: string, user: { id, username, ... } }
      this.accountService.updateTokens(response.refreshToken.token, response.refreshToken.refreshToken);
      console.log("update refresh token", response);
    } catch (error: any) {
      // If refresh fails, clear tokens and redirect to login.
      //this.accountService.clearTokens();
      console.log("error refresh token", error);
    }
  }
}