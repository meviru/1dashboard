import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-sing-in',
  templateUrl: './sing-in.component.html',
  styleUrls: ['./sing-in.component.scss']
})
export class SignInComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string;

  loginSub: Subscription;
  userSub: Subscription;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((param: any) => {
      if (Object.keys(param).length) {
        if (param?.sessionExpired) {
          this.errorMessage = "Your session has expired.";
        }
      }
    });

    this.userSub = this.authService.user.subscribe((user => {
      if (!user) {
        return
      }
      this.router.navigate(['/board']);
    }));

    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required])
    })
  }

  markFieldAsDirty(form: FormGroup) {
    for (let i in form.controls) {
      form.controls[i].markAsDirty();
    }
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.markFieldAsDirty(this.loginForm);
      return
    }

    this.isLoading = true;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.loginSub = this.authService.login(email, password).subscribe({
      complete: () => {
        this.errorMessage = "";
        this.isLoading = false;
        this.router.navigate(['board']);
      },
      error: (errorMessage) => {
        this.errorMessage = errorMessage;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loginSub && this.userSub) {
      this.userSub.unsubscribe();
      this.loginSub.unsubscribe();
    }
  }
}
