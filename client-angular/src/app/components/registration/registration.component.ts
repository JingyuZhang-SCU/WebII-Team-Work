// client-angular/src/app/components/registration/registration.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, CreateRegistration } from '../../models/event.model';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  event: Event | null = null;
  eventId: number = 0;
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  registration: CreateRegistration = {
    event_id: 0,
    full_name: '',
    email: '',
    phone: '',
    tickets_count: 1
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
      this.registration.event_id = this.eventId;
      this.loadEventDetails(this.eventId);
    }
  }

  loadEventDetails(id: number): void {
    this.loading = true;
    
    this.eventService.getEventDetails(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load event details';
        console.error('Error:', err);
      }
    });
  }

  calculateTotal(): number {
    if (!this.event) return 0;
    return this.event.ticket_price * this.registration.tickets_count;
  }

  onTicketsChange(): void {
    // Validation happens through Angular template
  }

  onSubmit(): void {
    if (!this.event) return;

    this.submitting = true;
    this.errorMessage = '';

    this.eventService.createRegistration(this.registration).subscribe({
      next: (response) => {
        this.submitting = false;
        this.successMessage = `✓ Registration successful! You have registered ${this.registration.tickets_count} ticket(s) for a total of $${this.calculateTotal()}.`;
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          this.errorMessage = 'You have already registered for this event.';
        } else if (err.status === 404) {
          this.errorMessage = 'Event not found.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        console.error('Registration error:', err);
      }
    });
  }

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
}