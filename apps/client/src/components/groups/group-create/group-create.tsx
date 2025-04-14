import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { IonInputCustomEvent } from '@ionic/core';
import { GroupService } from '../../../features/groups/group.service';
import { WebCryptoService } from '../../../features/web-crypto/web-crypto.service';
import { UserService } from '../../../features/users/user.service';
import { User } from '../../../features/users/user.model';
import { Group } from '../../../features/groups/group.model';

@Component({
  tag: 'group-create',
  styleUrl: 'group-create.scss',
})
export class GroupCreate {
  @State() groupName: string = '';
  @State() groupDescription: string = '';
  @State() errorMessage: string = '';

  @Event() groupCreated!: EventEmitter<Group>;

  private groupService = new GroupService();
  private userService = new UserService();
  async handleCreateGroup(event: Event) {
    event.preventDefault();

    if (!this.groupName) {
      this.errorMessage = 'Group name is required';
      return;
    }

    const activeUser = await this.userService.getActiveAccount() as User;

    const group = await this.groupService.createGroupWithKey({
      name: this.groupName,
      description: this.groupDescription,
      memberIds: [activeUser.id],
      members: [{
        userId: activeUser.id,
        role: 'admin'
      }]},WebCryptoService.generateKey());


    this.groupName = '';
    this.groupDescription = '';
    this.errorMessage = '';

    console.log(group);
    this.groupCreated.emit(group);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Create Group</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Create a New Group</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form onSubmit={(event) => this.handleCreateGroup(event)}>
              <ion-item>
                <ion-input
                  placeholder="Group Name"
                  value={this.groupName}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.groupName = e.target.value as string;
                    this.errorMessage = '';
                  }}
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-input
                  placeholder="Group Description (optional)"
                  value={this.groupDescription}
                  onIonInput={(e: IonInputCustomEvent<string>) =>
                    (this.groupDescription = e.target.value as string)
                  }
                ></ion-input>
              </ion-item>
              {this.errorMessage && (
                <ion-text color="danger">{this.errorMessage}</ion-text>
              )}
              <ion-button expand="full" type="submit">
                Create Group
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </ion-content>,
    ];
  }
}
