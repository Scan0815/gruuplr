import { Component, ComponentInterface, h, State } from '@stencil/core';
import { IonInputCustomEvent } from '@ionic/core';
import { gql } from 'graphql-tag';
import { Mutation } from '../../../generated/graphql';
import { RouterNavigate } from '../../../utilities/RouterNavigate';
import { AccountService } from '../../../services/account.service';
import { CreateUserInput } from '@gruuplr/dtos';
import { GraphQLService } from '../../../services/graphql/graphql.service';

@Component({
  tag: 'page-login',
  styleUrl: 'page-login.scss',
})
export class PageLogin implements ComponentInterface {
  @State() username: string = '';
  @State() password: string = '';
  @State() errorMessage: string = '';

  private graphQLService: GraphQLService = GraphQLService.getInstance();
  private accountService: AccountService = AccountService.getInstance();
  async handleLogin(event: Event) {
    event.preventDefault();

    // Simple validation: both fields must be filled
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in both fields.';
      return;
    }

    const LOGIN_MUTATION = gql`
        mutation Login($username: String!, $password: String!) {
            login(input: {username: $username, password: $password}) {
                token
                refreshToken
                user {
                    id
                    username
                    role
                    createdAt
                }
            }
        }
    `;

    try {
      const response = await this.graphQLService.request<Mutation, CreateUserInput>(
        'http://localhost:3000/graphql',
        LOGIN_MUTATION,
        {
          username: this.username,
          password: this.password,
        }
      );
      console.log('Login successful:', response);
      this.accountService.setTokens(response.login.token, response.login.refreshToken);
      this.accountService.setUser(response.login.user);
      // Redirect to the chat page with the logged-in user's id
     await RouterNavigate('/chat');
    } catch (error) {
      this.errorMessage = 'Login failed!';
      console.error(error);
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Login</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Login</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form onSubmit={(event) => this.handleLogin(event)}>
              <ion-item>
                <ion-input
                  placeholder="Username"
                  value={this.username}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.username = e.target.value as string;
                    // Clear error message on input change
                    this.errorMessage = '';
                  }}
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-input
                  type="password"
                  placeholder="Password"
                  value={this.password}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.password = e.target.value as string;
                    this.errorMessage = '';
                  }}
                ></ion-input>
              </ion-item>
              {this.errorMessage && (
                <ion-text color="danger">{this.errorMessage}</ion-text>
              )}
              <ion-button expand="full" type="submit">
                Login
              </ion-button>
              <ion-button fill="clear" href="/register">
                Not registered?
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </ion-content>
    ];
  }
}