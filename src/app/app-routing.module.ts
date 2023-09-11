import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardViewComponent } from './components/board-view/board-view.component';
import { FormsComponent } from './udemy/forms/forms.component';
import { SignInComponent } from './sing-in/sing-in.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: "", redirectTo: "sign-in", pathMatch: "full" },
  { path: "board", component: BoardViewComponent, canActivate: [AuthGuard] },
  { path: "sign-in", component: SignInComponent },
  { path: "forms", component: FormsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
