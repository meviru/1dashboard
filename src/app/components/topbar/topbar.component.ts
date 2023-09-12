import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/services/user.model';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  today = new Date();
  items: MenuItem[];

  userInfo: User;
  userName: string = "";
  userSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((value: User) => {
      if (value) {
        const atIndex = value.email.indexOf("@");
        this.userName = value.email.substring(0, atIndex);
      }
    });

    this.items = [
      {
        label: 'Settings',
        icon: 'pi pi-cog',
      },
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
        command: () => {
          this.authService.logout();
        }
      }
    ]
  }

  get initial() {
    return this.userName.substring(0, 1);
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
