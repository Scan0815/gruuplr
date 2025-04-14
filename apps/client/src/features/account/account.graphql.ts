import { GraphQLService } from '../../graphql/graphql.service';
import { gql } from 'graphql-tag';
import {
  CreateUserInput,
  LoginUserInput,
  Mutation,
  MutationRefreshTokenArgs
} from '../../generated/graphql';

export class AccountGraphQL {
  private static graphqlService = GraphQLService.getInstance();
  private static endpoint = 'http://localhost:3000/graphql';

  /**
   * Logs in a user using the GraphQLService, which handles token refresh if needed.
   *
   * @param eMail The user's email.
   * @param password The user's password.
   * @returns The login result including tokens and user details.
   */
  static async login(eMail: string, password: string): Promise<Mutation['login']> {
    const mutation = gql`
        mutation Login($eMail:String!, $password: String!) {
            login(input: {eMail:$eMail password: $password}) {
                token
                refreshToken
                user {
                    id
                    eMail
                    username
                    role
                    createdAt
                }
            }
        }
    `;
    const variables = { eMail, password };

    const result =  await this.graphqlService.request<Mutation, LoginUserInput>(
      this.endpoint,
      mutation,
      variables
    );

    return result.login;
  }

  /**
   * Registers a new user via GraphQL.
   *
   * @returns The newly registered user details.
   * @param username
   * @param eMail
   * @param password
   */
  static async register(username: string, eMail: string, password: string): Promise<Mutation['register']> {
    const mutation = gql`
        mutation Register($eMail: String!,$username: String!, $password: String!) {
            register(input: { eMail: $eMail,username: $username, password: $password }) {
                token
                refreshToken
                user {
                    id
                    username
                    eMail
                    role
                    createdAt
                }
            }
        }
    `;

    const variables = { username, eMail, password };
    const result =  await this.graphqlService.request<Mutation, CreateUserInput>(
      this.endpoint,
      mutation,
      variables
    );

    return result.register;

  }

  /**
   * Refreshes the access token using the provided refresh token.
   *
   * @param refreshToken The current refresh token.
   * @returns New tokens.
   */
  static async refreshToken(refreshToken: string): Promise<Mutation['refreshToken']> {
    const mutation = gql`
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

    const variables = { refreshToken };

    const result = await this.graphqlService.request<Mutation, MutationRefreshTokenArgs>(
      this.endpoint,
      mutation,
      variables
    );

    return result.refreshToken;
  }
}