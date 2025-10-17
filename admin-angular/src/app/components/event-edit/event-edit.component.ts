// admin-angular/src/app/components/event-edit/event-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, UpdateEvent, Category } from '../../models/event.model';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.css']
})
export class EventEditComponent implements OnInit {
  originalEvent: Event | null = null;
  categories: Category[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  eventId: number = 0;

  event: UpdateEvent = {
    name: '',
    description: '',
    date: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
    ticket_price: 0,
    goal_amount: 0,
    category_id: 0,
    is_active: true
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = +id;
      this.loadEventDetails();
      this.loadCategories();
    }
  }

  loadEventDetails(): void {
    this.loading = true;

    this.eventService.getEventDetails(this.eventId).subscribe({
      next: (data) => {
        this.originalEvent = data;
        
        const date = new Date(data.date);
        const formattedDate = date.toISOString().slice(0, 16);
        
        this.event = {
          name: data.name,
          description: data.description || '',
          date: formattedDate,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          ticket_price: data.ticket_price,
          goal_amount: data.goal_amount,
          category_id: data.category_id,
          is_active: data.is_active
        };
        
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load event details';
        console.error('Error:', err);
      }
    });
  }

  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onSubmit(): void {
    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const eventData: UpdateEvent = {
      ...this.event,
      description: this.event.description || undefined,
      latitude: this.event.latitude || undefined,
      longitude: this.event.longitude || undefined
    };

    this.eventService.updateEvent(this.eventId, eventData).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Event updated successfully!';
        
        setTimeout(() => {
          this.loadEventDetails();
        }, 1000);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Failed to update event. Please try again.';
        console.error('Update error:', err);
      }
    });
  }

  getProgress(): number {
    if (!this.originalEvent || this.originalEvent.goal_amount === 0) return 0;
    return Math.min((this.originalEvent.current_amount / this.originalEvent.goal_amount) * 100, 100);
  }
}