import { Component, ComponentInterface, h, Prop, State } from '@stencil/core';
import { GroupInviteService } from '../../../../features/group-invite/group-invite.service';
import { ModalService } from '../../../../modal/modal.service';

@Component({
  tag: 'group-join',
  styleUrl: 'group-join.scss',
  shadow: true,
})
export class GroupJoin implements ComponentInterface {
  @Prop() groupId!: string;
  @State() inviteCode: string = '';
  @State() isLoading: boolean = false;
  @State() error: string = '';
  @State() showInviteCode: boolean = false;
  @State() joinCode: string = '';
  @State() joinSuccess: boolean = false;

  private groupInviteService = GroupInviteService.getInstance();

  async joinGroup(ev:Event) {
    ev.preventDefault();

    if (!this.joinCode) {
      this.error = 'Please enter an invite code';
      return;
    }

    this.isLoading = true;
    this.error = '';
    try {
      const response = await this.groupInviteService.useInvite(this.joinCode);
      if (response.success) {
        this.joinSuccess = true;
      } else {
        this.error = response.error as string;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.error = err.message;
      } else {
        this.error = 'An unexpected error occurred';
      }
    } finally {
      this.isLoading = false;
    }
  }

  handleInput = (event: Event) => {
    const input = event.target as HTMLIonInputElement;
    this.joinCode = input.value?.toString() || '';
  };

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Join a Group</ion-title>
          <ion-buttons slot="end">
            <ion-button onClick={() => ModalService.closeModal()}>
              <ion-icon slot="icon-only" name="close-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <form onSubmit={(ev:Event) => this.joinGroup(ev)}>
        <ion-list>
            {!this.joinSuccess ? [
              <ion-item lines="full">
                  <ion-input
                    class={{
                      "ion-invalid" : (this.error !== ""),
                      "ion-touched" : true
                    }}
                    label="Enter Invite Code"
                    labelPlacement="floating"
                    value={this.joinCode}
                    onInput={this.handleInput}
                    type="text"
                    errorText={this.error}
                  ></ion-input>
              </ion-item>,
                <ion-button
                  type="submit"
                  expand="block"
                  disabled={this.isLoading}
                  class="join-button">
                  {this.isLoading ? (
                    <ion-spinner name="dots"></ion-spinner>
                  ) : (
                    'Join Group'
                  )}
                </ion-button>
            ] : (
              <ion-text color="success">
                <h2>Successfully joined the group!</h2>
              </ion-text>
            )}
        </ion-list>
        </form>
      </ion-content>,
    ];
  }
}
