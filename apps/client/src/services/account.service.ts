import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDto } from '../generated/graphql';
import { UserService } from './users/user.service';

export class AccountService {
  private static instance: AccountService;
  private tokenSubject: BehaviorSubject<string | null>;
  private refreshTokenSubject: BehaviorSubject<string | null>;
  private userSubject: BehaviorSubject<UserDto | null>;

  private constructor() {

    const activeUser = await UserService.getInstance().getActiveUser();


    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    this.tokenSubject = new BehaviorSubject<string | null>(token);
    this.refreshTokenSubject = new BehaviorSubject<string | null>(refreshToken);
    this.userSubject = new BehaviorSubject<UserDto | null>(null);
  }

  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  public setUser(user: UserDto): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  public getUser(): UserDto|null {
    return JSON.parse(localStorage.getItem('user') as string) as UserDto;
  }

  public setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
    this.refreshTokenSubject.next(refreshToken);
  }

  public updateTokens(token: string, refreshToken: string): void {
    this.setTokens(token, refreshToken);
  }

  public clearTokens(): void {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
  }

  public getToken(): string | null {
    return this.tokenSubject.value;
  }

  public getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  public isLoggedIn$(): Observable<boolean> {
    return this.tokenSubject.asObservable().pipe(map(token => !!token));
  }
}