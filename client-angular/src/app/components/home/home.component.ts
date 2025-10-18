// Client home page component displaying upcoming events
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  error = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // Load upcoming active events
  loadEvents(): void {
    this.loading = true;
    this.error = '';
    
    this.eventService.getHomeEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again later.';
        this.loading = false;
        console.error('Error loading events:', err);
      }
    });
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculate fundraising progress percentage
  getProgress(event: Event): number {
    if (event.goal_amount === 0) return 0;
    return Math.min((event.current_amount / event.goal_amount) * 100, 100);
  }
}