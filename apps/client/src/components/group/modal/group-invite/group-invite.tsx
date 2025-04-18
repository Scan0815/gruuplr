import { Component, h, Prop, State } from '@stencil/core';
import { GroupInviteService } from '../../../../features/group-invite/group-invite.service';
import { ModalService } from '../../../../modal/modal.service';

@Component({
  tag: 'group-invite',
  styleUrl: 'group-invite.scss',
  shadow: true,
})
export class GroupInvite {
  @Prop() groupId!: string;
  @State() inviteCode: string = '';
  @State() isLoading: boolean = false;
  @State() error: string = '';
  @State() showInviteCode: boolean = false;
  @State() joinCode: string = '';
  @State() joinSuccess: boolean = false;

  private groupInviteService = GroupInviteService.getInstance();

  async generateInvite() {
    this.isLoading = true;
    this.error = '';
    try {
      const code = await this.groupInviteService.createInvite(this.groupId);
      if (code) {
        this.inviteCode = code;
        this.showInviteCode = true;
      } else {
        this.error = 'Failed to generate invite code';
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


  async copyInviteCode() {
    if (this.inviteCode) {
      await navigator.clipboard.writeText(this.inviteCode);
    }
  }

  handleInput = (event: Event) => {
    const input = event.target as HTMLIonInputElement;
    this.joinCode = input.value?.toString() || '';
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Group Invite</ion-title>
          <ion-buttons slot="end">
            <ion-button onClick={() =>  ModalService.closeModal()}>
              <ion-icon slot="icon-only" name="close-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        {/* Generate Invite Section */}
        <ion-card>
          <ion-card-header>
            <ion-card-title>Invite Members</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {!this.showInviteCode ? (
              <ion-button
                expand="block"
                onClick={() => this.generateInvite()}
                disabled={this.isLoading}
              >
                {this.isLoading ? (
                  <ion-spinner name="dots"></ion-spinner>
                ) : (
                  'Generate Invite Code'
                )}
              </ion-button>
            ) : (
              <div class="invite-code-container">
                <ion-item>
                  <ion-input readonly={true} value={this.inviteCode}></ion-input>
                  <ion-button class="copy-button" fill="clear" onClick={() => this.copyInviteCode()}>
                    <ion-icon name="copy-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                </ion-item>
                <ion-button
                  expand="block"
                  onClick={() => this.showInviteCode = false}
                >
                  Generate New Code
                </ion-button>
              </div>
            )}
          </ion-card-content>
        </ion-card>
      </ion-content>]
  }
}
