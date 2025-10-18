// Admin service for managing events
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, Category, CreateEvent, UpdateEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get all events for admin dashboard
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/admin/events`);
  }

  // Get single event details
  getEventDetails(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // Create a new event
  createEvent(event: CreateEvent): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, event);
  }

  // Update an existing event
  updateEvent(id: number, event: UpdateEvent): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, event);
  }

  // Delete an event
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }
}