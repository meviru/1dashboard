import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

import { User } from './user.model';
import { config } from '../config';
import { Router } from '@angular/router';

export interface AuthResponseData {
  localId: string,
  email: string,
  displayName: string,
  idToken: string,
  registered: boolean,
  refreshToken: string,
  expiresIn: string
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  AUTH_URL: string = config.AUTH_URL;

  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`${this.AUTH_URL}:signInWithPassword`, {
      email: email,
      password: password,
      returnSecureToken: true
    }, {
      params: new HttpParams().set('key', config.API_KEY)
    }).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
    }));
  }

  logout(isSessionExpired: boolean = false) {
    this.user.next(null);
    if (!isSessionExpired) {
      this.router.navigate(["/"]);
    } else {
      this.router.navigate(["/"], { queryParams: { sessionExpired: true } });
    }
    localStorage.removeItem("userData");
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout(true);
    }, expirationDuration)
  }

  autoLogin() {
    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      return;
    }

    const expirationDate = new Date(userData._tokenExpirationDate);
    const loadedUser = new User(userData.email, userData.id, userData._token, expirationDate);
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = expirationDate.getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  private handleAuth(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem("userData", JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = "An unknown error occured! Please try again.";
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(() => errorMessage);
    }

    switch (errorRes.error.error.message) {
      case "TOO_MANY_ATTEMPTS_TRY_LATER":
        errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts."
        break;
      case "EMAIL_NOT_FOUND":
        errorMessage = "This account does not exist."
        break;
      case "INVALID_PASSWORD":
        errorMessage = "Your email or password is invalid."
        break;
      case "USER_DISABLED":
        errorMessage = "Your account has been disabled."
        break;
    }
    return throwError(() => errorMessage);
  }
}
