import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './shared/material-module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import * as FA from '@fortawesome/free-solid-svg-icons';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutTemplateComponent } from './views/layout-template.component';
import { HomeComponent } from './views/home.component';
import { SignupComponent } from './views/account/signup.component';
import { ResetComponent } from './views/account/reset.component';
import { LoginComponent } from './views/account/login.component';
import { ProfileComponent } from './views/account/profile.component';
import { ForgotComponent } from './views/account/forgot.component';
import { ContactComponent } from './views/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutTemplateComponent,
    HomeComponent,
    SignupComponent,
    ResetComponent,
    LoginComponent,
    ProfileComponent,
    ForgotComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    NgbModule,
    NgSelectModule,
    FontAwesomeModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    library.add(FA.faInfoCircle);
  }
}
