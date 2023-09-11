import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { User } from './services/user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dashboard';
  isLoggedIn: boolean = true;

  userInfo: User;
  userSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.autoLogin();
    
    this.userSub = this.authService.user.subscribe((value: User) => {
      if (value) {
        this.userInfo = value;
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
