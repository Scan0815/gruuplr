import { Component, ComponentInterface, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { Group } from '../../../../features/group/group.model';
import { GroupService } from '../../../../features/group/group.service';
import { IonInputCustomEvent } from '@ionic/core';
import { ModalService } from '../../../../modal/modal.service';

@Component({
  tag: 'group-update',
  styleUrl: 'group-update.scss',
  shadow: true,
})
export class GroupUpdate implements ComponentInterface {
  @Prop() group: Group | undefined;
  @State() groupName: string = '';
  @State() groupDescription: string = '';
  @State() errorMessage: string = '';
  @State() isLoading: boolean = false;

  @Event() groupUpdated!: EventEmitter<Group>;
  @Event() groupUpdatedError!: EventEmitter<string>;

  private groupService = GroupService.getInstance();

  componentWillLoad(): Promise<void> | void {
    if (this.group) {
      this.groupName = this.group.name;
      this.groupDescription = this.group.description || '';
    }
  }

  private validateInputs(): boolean {
    if (!this.groupName.trim()) {
      this.errorMessage = 'Group name is required';
      return false;
    }
    if (this.groupName.length > 50) {
      this.errorMessage = 'Group name must be less than 50 characters';
      return false;
    }
    if (this.groupDescription.length > 200) {
      this.errorMessage = 'Group description must be less than 200 characters';
      return false;
    }
    return true;
  }

  async handleUpdateGroup(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.validateInputs()) {
      return;
    }

    this.isLoading = true;

    try {

      const group: Group = Object.assign(this.group as Group || {}, {
        name: this.groupName.trim(),
        description: this.groupDescription.trim(),
      })

      console.log(group);

      console.log(this.groupService)

      await this.groupService.updateGroup(this.group?.id as string, {
        name: group.name,
        description: group.description,
      });

      if (!group) {
        throw new Error('Failed to create group');
      }

      this.groupName = '';
      this.groupDescription = '';
      this.groupUpdated.emit(group);
    } catch (error) {
      console.error('Error creating group:', error);
      this.errorMessage =
        error instanceof Error ? error.message : 'Failed to update group';
      this.groupUpdatedError.emit(this.errorMessage);
    } finally {
      this.isLoading = false;
      await ModalService.closeModal(this.group,"group-update");
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Update Group</ion-title>
          <ion-buttons slot="end">
            <ion-button onClick={() => ModalService.closeModal()}>
              <ion-icon slot="icon-only" name="close-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Create a New Group</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form onSubmit={(event) => this.handleUpdateGroup(event)}>
              <ion-item>
                <ion-input
                  placeholder="Group Name"
                  value={this.groupName}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.groupName = e.target.value as string;
                    this.errorMessage = '';
                  }}
                  disabled={this.isLoading}
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-input
                  placeholder="Group Description (optional)"
                  value={this.groupDescription}
                  onIonInput={(e: IonInputCustomEvent<string>) =>
                    (this.groupDescription = e.target.value as string)
                  }
                  disabled={this.isLoading}
                ></ion-input>
              </ion-item>
              {this.errorMessage && (
                <ion-text color="danger">{this.errorMessage}</ion-text>
              )}
              <ion-button expand="full" type="submit" disabled={this.isLoading}>
                {this.isLoading ? 'Creating...' : 'Update Group'}
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </ion-content>,
    ];
  }
}
