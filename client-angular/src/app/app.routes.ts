// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { RegistrationComponent } from './components/registration/registration.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'event/:id', component: EventDetailsComponent },
  { path: 'register/:id', component: RegistrationComponent },
  { path: '**', redirectTo: '' }
];