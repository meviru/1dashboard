import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],

})
export class FormsComponent {
  genders = ["Male", "Female"];
  signupForm: FormGroup;

  constructor() {
    this.signupForm = new FormGroup({
      username: new FormControl(null, [Validators.required, this.invalidName.bind(this)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      gender: new FormControl("Male"),
      hobbies: new FormArray([])
    });
  }

  onSubmit() {
    console.log(this.signupForm);
  }

  addHobbies() {
    const control = new FormControl(null, Validators.required);
    (<FormArray>this.signupForm.get('hobbies')).push(control);
  }

  getHobbies() {
    return (<FormArray>this.signupForm.get('hobbies')).controls;
  }

  invalidName(control: FormControl): { [s: string]: boolean } | null {
    if (control.value === "test") {
      return { 'invalidName': true };
    }
    return null;
  }

  asyncInvalidName(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise((resolve, reject) => {
      setTimeout((): any => {
        if (control.value === "testname") {
          resolve({ 'invalidUsername': true });
        }
        return null;
      }, 2000)
    })
    return promise;
  }
}
