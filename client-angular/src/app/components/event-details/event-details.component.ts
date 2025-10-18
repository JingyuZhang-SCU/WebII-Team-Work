// Event details page showing full event information and weather
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { WeatherService } from '../../services/weather.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  loading = false;
  error = '';
  
  // Weather data
  weatherData: any = null;
  loadingWeather = false;
  weatherDescription = '';
  weatherIcon = '';
  weatherTemp = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private weatherService: WeatherService
  ) {}

  ngOnInit(): void {
    // Get event ID from route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEventDetails(+id);
    }
  }

  // Load event details
  loadEventDetails(id: number): void {
    this.loading = true;
    this.error = '';
    
    this.eventService.getEventDetails(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
        
        // Load weather if coordinates are available
        if (data.latitude && data.longitude) {
          this.loadWeather(data.latitude, data.longitude);
        }
      },
      error: (err) => {
        this.error = 'Failed to load event details';
        this.loading = false;
        console.error('Error loading event:', err);
      }
    });
  }

  // Fetch weather forecast for event location
  loadWeather(latitude: number, longitude: number): void {
    this.loadingWeather = true;
    
    this.weatherService.getWeather(latitude, longitude).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.loadingWeather = false;
        
        // Extract weather information from first day of forecast
        if (data.daily && data.daily.weather_code && data.daily.weather_code.length > 0) {
          const code = data.daily.weather_code[0];
          const maxTemp = data.daily.temperature_2m_max[0];
          const minTemp = data.daily.temperature_2m_min[0];
          
          this.weatherDescription = this.weatherService.getWeatherDescription(code);
          this.weatherIcon = this.weatherService.getWeatherIcon(code);
          this.weatherTemp = `${maxTemp}°C / ${minTemp}°C`;
        }
      },
      error: (err) => {
        this.loadingWeather = false;
        console.error('Error loading weather:', err);
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
  getProgress(): number {
    if (!this.event || this.event.goal_amount === 0) return 0;
    return Math.min((this.event.current_amount / this.event.goal_amount) * 100, 100);
  }
}