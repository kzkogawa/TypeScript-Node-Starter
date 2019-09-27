import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutTemplateComponent } from './views/layout-template.component';
import { HomeComponent } from './views/home.component';
import { ProfileComponent } from './views/account/profile.component';
import { LoginComponent } from './views/account/login.component';
import { SignupComponent } from './views/account/signup.component';
import { ContactComponent } from './views/contact.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutTemplateComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      { path: '**', redirectTo: '' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
