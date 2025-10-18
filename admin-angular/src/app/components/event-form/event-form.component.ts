// Admin component for creating new events
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CreateEvent, Category } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  categories: Category[] = [];
  submitting = false;
  errorMessage = '';
  successMessage = '';

  // New event form data
  event: CreateEvent = {
    name: '',
    description: '',
    date: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
    ticket_price: 0,
    goal_amount: 0,
    category_id: 0
  };

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Load all categories for dropdown
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

  // Submit form to create new event
  onSubmit(): void {
    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare event data (convert empty strings to undefined)
    const eventData: CreateEvent = {
      ...this.event,
      description: this.event.description || undefined,
      latitude: this.event.latitude || undefined,
      longitude: this.event.longitude || undefined
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.successMessage = 'Event created successfully!';
        
        // Redirect to event list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/events']);
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Failed to create event. Please check your input and try again.';
        console.error('Create event error:', err);
      }
    });
  }
}