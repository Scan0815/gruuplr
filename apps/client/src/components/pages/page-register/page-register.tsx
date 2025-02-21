import { Component, ComponentInterface, h, State } from '@stencil/core';
import { request } from 'graphql-request';
import { IonInputCustomEvent } from '@ionic/core';
import { gql } from 'graphql-tag';
import { Mutation } from '../../../generated/graphql';
import { RouterNavigate } from '../../../utilities/RouterNavigate';
import { AccountService } from '../../../services/account.service';
import { CreateUserInput } from '@gruuplr/dtos';

@Component({
  tag: 'page-register',
  styleUrl: 'page-register.scss',
})
export class PageRegister implements ComponentInterface {
  @State() username: string = '';
  @State() password: string = '';
  @State() confirmPassword: string = '';
  @State() errorMessage: string = '';
  @State() passwordStrength: number = 0; // 0 - 1 (für Fortschrittsbalken)
  @State() passwordColor: string = 'danger'; // Farbe für `ion-progress-bar`
  @State() isFormValid: boolean = false;

  /**
   * Überprüft, wie sicher das Passwort ist (0-100%)
   */
  private checkPasswordStrength(password: string) {
    let strength = 0;

    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

    this.passwordStrength = strength / 100; // Wert für `ion-progress-bar`

    // 🔥 Farbe ändern je nach Stärke
    if (strength <= 25) this.passwordColor = 'danger'; // 🔴 Schwach
    else if (strength <= 50) this.passwordColor = 'warning'; // 🟠 Mittel
    else if (strength <= 75) this.passwordColor = 'success'; // 🟡 Gut
    else this.passwordColor = 'success'; // ✅ Stark
  }

  /**
   * Prüft, ob das Formular korrekt ausgefüllt wurde
   */
  private validateForm() {
    this.checkPasswordStrength(this.password);
    const passwordsMatch = this.password === this.confirmPassword;
    const isUsernameValid = this.username.length >= 3;
    this.isFormValid =
      this.passwordStrength >= 0.7 && passwordsMatch && isUsernameValid;
  }

  async handleRegister(event: Event) {
    event.preventDefault();

    if (!this.isFormValid) return;

    const REGISTER_MUTATION = gql`
        mutation Register($username: String!, $password: String!) {
            register(input: {username: $username, password: $password}) {
                token
                user {
                    id
                    username
                    role
                    createdAt
                }
            }
        }
    `;


    try {
      const response = await request<Mutation,CreateUserInput>(
        'http://localhost:3000/graphql',
        REGISTER_MUTATION,
        {
          username: this.username,
          password: this.password,
        }
      );
      console.log(response);
      AccountService.getInstance().setToken(response.register.token);
      AccountService.getInstance().setUser(response.register.user);
      await RouterNavigate('/chat');
    } catch (error) {
      this.errorMessage = 'Registrierung fehlgeschlagen!';
      console.error(error);
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Registrieren</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Registrieren</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form onSubmit={(event) => this.handleRegister(event)}>
              <ion-item>
                <ion-input
                  placeholder="Benutzername"
                  value={this.username}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.username = e.target.value as string;
                    this.validateForm();
                  }}
                />
              </ion-item>
              <ion-item>
                <ion-input
                  type="password"
                  placeholder="Passwort"
                  value={this.password}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.password = e.target.value as string;
                    this.validateForm();
                  }}
                >
                  <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                </ion-input>
              </ion-item>

              {/* 🔥 Fortschrittsbalken für Passwort-Sicherheit */}
              <ion-progress-bar value={this.passwordStrength} color={this.passwordColor} class="password-bar"></ion-progress-bar>

              <ion-item>
                <ion-input
                  type="password"
                  placeholder="Passwort bestätigen"
                  value={this.confirmPassword}
                  onIonInput={(e: IonInputCustomEvent<string>) => {
                    this.confirmPassword = e.target.value as string;
                    this.validateForm();
                  }}
                >
                  <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                </ion-input>
              </ion-item>
              {this.errorMessage && (
                <ion-text color="danger">{this.errorMessage}</ion-text>
              )}
              <ion-button expand="full" type="submit">
                Registrieren
              </ion-button>
              <ion-button fill="clear" href="/login">
                Bereits registriert?
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </ion-content>,
    ];
  }
}
