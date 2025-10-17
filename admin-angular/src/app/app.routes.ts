// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventEditComponent } from './components/event-edit/event-edit.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/edit/:id', component: EventEditComponent },
  { path: '**', redirectTo: '' }
];