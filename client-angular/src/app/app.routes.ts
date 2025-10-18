// CLIENT ROUTES (client-angular/src/app/app.routes.ts)
// Define client-side application routes
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { RegistrationComponent } from './components/registration/registration.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },                    // Home page
  { path: 'search', component: SearchComponent },            // Search events
  { path: 'event/:id', component: EventDetailsComponent },   // Event details
  { path: 'register/:id', component: RegistrationComponent }, // Registration form
  { path: '**', redirectTo: '' }                             // Fallback to home
];