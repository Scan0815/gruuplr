import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { GroupDto } from '../../../generated/graphql';
import { IonInputCustomEvent } from '@ionic/core';
import { GroupService } from '../../../services/groups/group.service';

@Component({
  tag: 'group-create',
  styleUrl: 'group-create.scss',
})
export class GroupCreate {
  @State() groupName: string = '';
  @State() groupDescription: string = '';
  @State() errorMessage: string = '';

  @Event() groupCreated!: EventEmitter<GroupDto>;

  async handleCreateGroup(event: Event) {
    event.preventDefault();

    if (!this.groupName) {
      this.errorMessage = 'Group name is required';
      return;
    }

    const group = await GroupService.getInstance().createGroup(
      this.groupName,
      this.groupDescription
    );

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
