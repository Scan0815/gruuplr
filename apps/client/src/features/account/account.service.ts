import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../users/user.model';

export class AccountService {
  private static instance: AccountService;
  private tokenSubject: BehaviorSubject<string | null>;
  private refreshTokenSubject: BehaviorSubject<string | null>;
  private userIdSubject: BehaviorSubject<string | null>;
  private userSubject: BehaviorSubject<User | null>;
  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor() {
    const token = localStorage.getItem('token');
    console.log('token:',token);
    const refreshToken = localStorage.getItem('refreshToken');
    this.tokenSubject = new BehaviorSubject<string | null>(token);
    this.refreshTokenSubject = new BehaviorSubject<string | null>(refreshToken);
    this.userIdSubject = new BehaviorSubject<string | null>(null);
    this.userSubject = new BehaviorSubject<User | null>(null);
    if(token) {
      this.isLoggedInSubject.next(!!token);
    }
  }

  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  public setUserId(userId:string){
    localStorage.setItem('userId', userId);
    this.userIdSubject.next(userId);
  }

  public setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  public getUserId(){
    return localStorage.getItem('userId') as string
  }

  public switchAccount(user: User): void {
    this.setUserId(user.id);
    this.updateTokens(user.accessToken as string, user.refreshToken as string);
  }

  public observable(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  public getUser(): User|null {
    return JSON.parse(localStorage.getItem('user') as string) as User;
  }

  public setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
    this.refreshTokenSubject.next(refreshToken);
    this.isLoggedInSubject.next(true);
  }

  public updateTokens(token: string, refreshToken: string): void {
    this.setTokens(token, refreshToken);
  }

  public loggOut(): void {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.userSubject.next(null);
    this.userIdSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  public getToken(): string | null {
    return this.tokenSubject.value;
  }

  public getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  public isLoggedInValue() {
    return this.isLoggedInSubject.getValue();
  }

  public isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }
}