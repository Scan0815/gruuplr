import { Component, ComponentInterface, Event, EventEmitter, h, State } from '@stencil/core';
import { IonInputCustomEvent } from '@ionic/core';
import { GroupService } from '../../../../features/group/group.service';
import { WebCryptoService } from '../../../../features/web-crypto/web-crypto.service';
import { Group } from '../../../../features/group/group.model';
import { ModalService } from '../../../../modal/modal.service';

@Component({
  tag: 'group-create',
  styleUrl: 'group-create.scss',
  shadow: true
})
export class GroupCreate implements ComponentInterface {
  @State() groupName: string = '';
  @State() groupDescription: string = '';
  @State() errorMessage: string = '';
  @State() isLoading: boolean = false;

  @Event() groupCreated!: EventEmitter<Group>;
  @Event() groupCreationError!: EventEmitter<string>;

  private groupService = GroupService.getInstance();

  private validateInputs(): boolean {
    if (!this.groupName.trim()) {
      this.errorMessage = 'Group name is required';
      return false;
    }
    if (this.groupName.length > 50) {
      this.errorMessage = 'Group name must be less than 50 characters';
      return false;
    }
    if (!this.groupDescription.trim()) {
      this.errorMessage = 'Group groupDescription is required';
      return false;
    }
    if (this.groupDescription.length > 200) {
      this.errorMessage = 'Group description must be less than 200 characters';
      return false;
    }
    return true;
  }

  async handleCreateGroup(event: Event) {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.validateInputs()) {
      return;
    }

    this.isLoading = true;

    try {
      const encryptionKey = WebCryptoService.generateKey();
      if (!encryptionKey) {
        throw new Error('Failed to generate encryption key');
      }

      const group = await this.groupService.createGroupWithKey(
        this.groupName.trim(),
        this.groupDescription.trim(),
        encryptionKey
      );

      if (!group) {
        throw new Error('Failed to create group');
      }

      this.groupName = '';
      this.groupDescription = '';
      this.groupCreated.emit(group);
    } catch (error) {
      console.error('Error creating group:', error);
      this.errorMessage =
        error instanceof Error ? error.message : 'Failed to create group';
      this.groupCreationError.emit(this.errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Create Group</ion-title>
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
            <form onSubmit={(event) => this.handleCreateGroup(event)}>
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
                {this.isLoading ? 'Creating...' : 'Create Group'}
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </ion-content>,
    ];
  }
}
