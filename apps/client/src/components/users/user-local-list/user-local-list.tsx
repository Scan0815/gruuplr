import { Component, ComponentInterface, EventEmitter,Event, h, State } from '@stencil/core';
import { AccountService } from '../../../features/account/account.service';
import { RouterNavigate } from '../../../utilities/RouterNavigate';
import { User } from '../../../features/users/user.model';
import { UserService } from '../../../features/users/user.service';

@Component({
  tag: 'user-local-list',
  styleUrl: 'user-local-list.scss',
})
export class UserLocalList implements ComponentInterface {
  @State() users: User[] = [];
  @Event() userSwitched!: EventEmitter<User>;
  @Event() loggedOut!: EventEmitter<boolean>;

  private userService = new UserService();

  async componentWillLoad() {
    this.users = await this.userService.listUsers();
  }

  async switchLocalUser(user: User) {
    await this.userService.activateUser(user.id);
    AccountService.getInstance().switchAccount(user);
    this.userSwitched.emit(user);
  }

  async loggOut() {
    AccountService.getInstance().loggOut();
    this.loggedOut.emit(true);
    await RouterNavigate('/login', 'back');
  }

  render() {
    return (
      <ion-list>
        {this.users.map((user) => (
          <ion-item lines="full" onClick={() => this.switchLocalUser(user)}>
            <ion-label>{user.username}</ion-label>
          </ion-item>
        ))}
        <ion-item lines="none" onClick={() => this.loggOut()}>
          <ion-label>abmelden</ion-label>
        </ion-item>
      </ion-list>
    );
  }
}
