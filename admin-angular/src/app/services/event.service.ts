// src/app/services/event.service.ts

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

  // 获取所有活动（管理端用）
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/admin/events`);
  }

  // 获取单个活动详情
  getEventDetails(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // 获取所有分类
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // 创建新活动
  createEvent(event: CreateEvent): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, event);
  }

  // 更新活动
  updateEvent(id: number, event: UpdateEvent): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, event);
  }

  // 删除活动
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }
}