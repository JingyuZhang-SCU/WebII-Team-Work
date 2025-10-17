// src/app/services/event.service.ts

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

  // 获取首页活动列表
  getHomeEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/home`);
  }

  // 搜索活动
  searchEvents(category?: string, location?: string, date?: string): Observable<Event[]> {
    let params = new HttpParams();
    
    if (category) params = params.set('category', category);
    if (location) params = params.set('location', location);
    if (date) params = params.set('date', date);

    return this.http.get<Event[]>(`${this.apiUrl}/events/search`, { params });
  }

  // 获取活动详情（包含注册列表）
  getEventDetails(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // 获取所有分类
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // 创建注册
  createRegistration(registration: CreateRegistration): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrations`, registration);
  }
}