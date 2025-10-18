// Admin dashboard component displaying event statistics
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  events: Event[] = [];
  recentEvents: Event[] = [];
  loading = false;

  // Statistics
  totalEvents = 0;
  activeEvents = 0;
  totalRegistrations = 0;
  totalRaised = 0;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Load all events and calculate statistics
  loadDashboardData(): void {
    this.loading = true;

    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.calculateStats();
        this.recentEvents = data.slice(0, 5); // Show 5 most recent events
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
      }
    });
  }

  // Calculate dashboard statistics
  calculateStats(): void {
    this.totalEvents = this.events.length;
    this.activeEvents = this.events.filter(e => e.is_active).length;
    this.totalRegistrations = this.events.reduce((sum, e) => sum + (e.registration_count || 0), 0);
    
    // Calculate total amount raised across all events
    this.totalRaised = this.events.reduce((sum, e) => {
      const amount = Number(e.current_amount) || 0;
      return sum + amount;
    }, 0);
    
    // Round to 2 decimal places
    this.totalRaised = Math.round(this.totalRaised * 100) / 100;
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}