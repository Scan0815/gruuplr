import { Component, ComponentInterface, h, State } from '@stencil/core';
import { AccountService } from '../../../features/account/account.service';
import { User } from '../../../features/users/user.model';
import { UserService } from '../../../features/users/user.service';

@Component({
  tag: 'chat-default',
  styleUrl: 'chat-default.scss',
})
export class ChatDefault implements ComponentInterface {
  private popOver: HTMLIonPopoverElement | null = null;
  @State() activeAccount:User|undefined;

  private userService = new UserService();
  async componentWillLoad() {
    this.activeAccount = await this.userService.getActiveAccount();
    AccountService.getInstance().isLoggedIn().subscribe(async () => {
      this.activeAccount = await this.userService.getActiveAccount();
    })
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Chat</ion-title>
          <ion-buttons slot="end">
            <ion-button id="click-trigger">{this.activeAccount?.username}</ion-button>
            <ion-popover
              ref={(ref: HTMLIonPopoverElement) => (this.popOver = ref)}
              trigger="click-trigger"
              trigger-action="click"
            >
              <ion-content className="ion-padding">
                <user-local-list
                  onUserSwitched={() => this.popOver?.dismiss()}
                  onLoggedOut={()=> this.popOver?.dismiss()}
                />
              </ion-content>
            </ion-popover>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Welcome to Gruuplr Chat!</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Please select a group from the menu to start chatting.
          </ion-card-content>
        </ion-card>
      </ion-content>,
    ];
  }
}
