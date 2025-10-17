// admin-angular/src/app/components/event-list/event-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  showDeleteModal = false;
  eventToDelete: Event | null = null;
  deleting = false;
  deleteError = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;

    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getProgress(event: Event): number {
    if (event.goal_amount === 0) return 0;
    return Math.min((event.current_amount / event.goal_amount) * 100, 100);
  }

  confirmDelete(event: Event): void {
    this.eventToDelete = event;
    this.showDeleteModal = true;
    this.deleteError = '';
  }

  deleteEvent(): void {
    if (!this.eventToDelete) return;

    this.deleting = true;
    this.deleteError = '';

    this.eventService.deleteEvent(this.eventToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteModal = false;
        this.loadEvents();
      },
      error: (err) => {
        this.deleting = false;
        if (err.status === 409) {
          this.deleteError = 'Cannot delete event with existing registrations.';
        } else {
          this.deleteError = 'Failed to delete event. Please try again.';
        }
        console.error('Delete error:', err);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.eventToDelete = null;
    this.deleteError = '';
  }

  hasRegistrations(): boolean {
    return (this.eventToDelete?.registration_count ?? 0) > 0;
  }
}