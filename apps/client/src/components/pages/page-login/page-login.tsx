import { Component, ComponentInterface, h, State } from '@stencil/core';
import { IonInputCustomEvent } from '@ionic/core';
import { RouterNavigate } from '../../../utilities/RouterNavigate';
import { AccountService } from '../../../features/account/account.service';
import { UserService } from '../../../features/users/user.service';
import { AccountGraphQL } from '../../../features/account/account.graphql';
import { User } from '../../../features/users/user.model';

@Component({
  tag: 'page-login',
  styleUrl: 'page-login.scss',
})
export class PageLogin implements ComponentInterface {
  @State() username: string = '';
  @State() password: string = '';
  @State() eMail: string = '';
  @State() errorMessage: string = '';

  private userService = new UserService();
  private accountService: AccountService = AccountService.getInstance();

  async handleLogin(event: Event) {
    event.preventDefault();

    // Simple validation: both fields must be filled
    if (!this.eMail || !this.password) {
      this.errorMessage = 'Please fill in both fields.';
      return;
    }
    try {
      const result = await AccountGraphQL.login(this.eMail, this.password);

      const localUser:User = Object.assign({
        accessToken: result.token,
        refreshToken: result.refreshToken,
        name: result.user.username,
        active: 1,
      },result.user)

      console.log(localUser);

      await this.userService.createOrUpdateUser(localUser);
      this.accountService.switchAccount(localUser);
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
                  placeholder="eMail"
                  value={this.eMail}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.eMail = e.target.value as string;
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
      </ion-content>,
    ];
  }
}
