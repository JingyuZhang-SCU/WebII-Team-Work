// Client-side service for event-related API calls
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, Category, Registration, CreateRegistration } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Fetch active upcoming events for home page
  getHomeEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/home`);
  }

  // Search events with optional filters
  searchEvents(category?: string, location?: string, date?: string): Observable<Event[]> {
    let params = new HttpParams();
    
    // Build query parameters
    if (category) params = params.set('category', category);
    if (location) params = params.set('location', location);
    if (date) params = params.set('date', date);

    return this.http.get<Event[]>(`${this.apiUrl}/events/search`, { params });
  }

  // Get event details including registrations
  getEventDetails(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // Get all event categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // Create a new registration for an event
  createRegistration(registration: CreateRegistration): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrations`, registration);
  }
}