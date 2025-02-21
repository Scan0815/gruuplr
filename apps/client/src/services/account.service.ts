import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDTO } from '@gruuplr/dtos';

export class AccountService {
  private static instance: AccountService;
  private tokenSubject: BehaviorSubject<string | null>;
  private userSubject: BehaviorSubject<UserDTO | null>;
  // Private constructor to enforce singleton usage.
  private constructor() {
    const token = localStorage.getItem('token');
    this.tokenSubject = new BehaviorSubject<string | null>(token);
    this.userSubject = new BehaviorSubject<UserDTO | null>(null);
  }

  /**
   * Returns the singleton instance of AccountService.
   */
  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  /**
   * Saves the token and updates the observable state.
   * @param token - The authentication token to save.
   */
  public setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  public setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  public getUser(): UserDTO|null {
    return JSON.parse(localStorage.getItem('user') as string) as UserDTO;
  }

  /**
   * Retrieves the current token.
   * @returns The stored token or null if not set.
   */
  public getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Clears the token and updates the observable state.
   */
  public clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  /**
   * An observable that emits true if a token is present (i.e. the user is logged in),
   * and false otherwise.
   * @returns Observable<boolean> reflecting the login state.
   */
  public isLoggedIn$(): Observable<boolean> {
    return this.tokenSubject.asObservable().pipe(
      map(token => token !== null && token !== '')
    );
  }
}