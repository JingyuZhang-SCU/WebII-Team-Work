// Event search page with filters
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, Category } from '../../models/event.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  categories: Category[] = [];
  events: Event[] = [];
  loading = false;
  hasSearched = false;
  
  // Search filters
  searchParams = {
    category: '',
    location: '',
    date: ''
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Load all available categories
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

  // Search events with current filters
  onSearch(): void {
    this.loading = true;
    this.hasSearched = true;
    
    this.eventService.searchEvents(
      this.searchParams.category || undefined,
      this.searchParams.location || undefined,
      this.searchParams.date || undefined
    ).subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching events:', err);
        this.loading = false;
        this.events = [];
      }
    });
  }

  // Clear all search filters
  onClear(): void {
    this.searchParams = {
      category: '',
      location: '',
      date: ''
    };
    this.events = [];
    this.hasSearched = false;
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
}