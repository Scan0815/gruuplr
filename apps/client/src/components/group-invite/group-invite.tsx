import { Component, h, State, Prop, ComponentInterface } from '@stencil/core';
import { GroupInviteService } from '../../features/group-invite/group-invite.service';

@Component({
  tag: 'group-invite',
  styleUrl: 'group-invite.css',
  shadow: true,
})
export class GroupInvite implements ComponentInterface {
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

  async joinGroup() {
    if (!this.joinCode) {
      this.error = 'Please enter an invite code';
      return;
    }

    this.isLoading = true;
    this.error = '';
    try {
      const success = await this.groupInviteService.useInvite(this.joinCode);
      if (success) {
        this.joinSuccess = true;
      } else {
        this.error = 'Invalid or expired invite code';
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

  copyInviteCode() {
    if (this.inviteCode) {
      navigator.clipboard.writeText(this.inviteCode);
    }
  }

  handleInput = (event: Event) => {
    const input = event.target as HTMLIonInputElement;
    this.joinCode = input.value?.toString() || '';
  }

  render() {
    return (
      <div class="group-invite-container">
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
                  <ion-input readonly value={this.inviteCode}></ion-input>
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

        {/* Join Group Section */}
        <ion-card>
          <ion-card-header>
            <ion-card-title>Join Group</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {!this.joinSuccess ? (
              <div>
                <ion-item>
                  <ion-label position="floating">Enter Invite Code</ion-label>
                  <ion-input
                    value={this.joinCode}
                    onInput={this.handleInput}
                    type="text"
                  ></ion-input>
                </ion-item>
                <ion-button
                  expand="block"
                  onClick={() => this.joinGroup()}
                  disabled={this.isLoading}
                  class="join-button"
                >
                  {this.isLoading ? (
                    <ion-spinner name="dots"></ion-spinner>
                  ) : (
                    'Join Group'
                  )}
                </ion-button>
              </div>
            ) : (
              <ion-text color="success">
                <h2>Successfully joined the group!</h2>
              </ion-text>
            )}
          </ion-card-content>
        </ion-card>

        {/* Error Message */}
        {this.error && (
          <ion-text color="danger">
            <p>{this.error}</p>
          </ion-text>
        )}
      </div>
    );
  }
} 