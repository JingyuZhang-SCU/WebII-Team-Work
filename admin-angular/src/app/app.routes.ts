// ADMIN ROUTES (admin-angular/src/app/app.routes.ts)
// Define admin application routes
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventEditComponent } from './components/event-edit/event-edit.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },                // Dashboard
  { path: 'events', component: EventListComponent },          // All events
  { path: 'events/new', component: EventFormComponent },      // Create event
  { path: 'events/edit/:id', component: EventEditComponent }, // Edit event
  { path: '**', redirectTo: '' }                              // Fallback to dashboard
];
