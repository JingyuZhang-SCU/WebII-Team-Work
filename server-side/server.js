const express = require('express');
const cors = require('cors');
const path = require('path');
const connection = require('./event_db');

const app = express();
const port = 3000;

// Enable CORS for cross-origin requests
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// ============================================
// Client-side API endpoints
// ============================================

// Get all active events (for testing purposes)
app.get('/api/events', (req, res) => {
  const query = `
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.is_active = TRUE
    ORDER BY e.date ASC
  `;
  
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Home page: Get all active upcoming events
app.get('/api/events/home', (req, res) => {
  const query = `
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.is_active = TRUE AND e.date >= NOW()
    ORDER BY e.date ASC
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Search events by category, location, or date
app.get('/api/events/search', (req, res) => {
  const { category, location, date } = req.query;
  let query = `
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.is_active = TRUE
  `;
  let params = [];

  // Add filters based on query parameters
  if (category) {
    query += ` AND c.name = ?`;
    params.push(category);
  }
  if (location) {
    query += ` AND e.location LIKE ?`;
    params.push(`%${location}%`);
  }
  if (date) {
    query += ` AND DATE(e.date) = ?`;
    params.push(date);
  }

  query += ` ORDER BY e.date ASC`;

  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get all event categories
app.get('/api/categories', (req, res) => {
  connection.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get event details including registrations
app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  // Query for event details
  const eventQuery = `
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.id = ?
  `;
  
  // Query for event registrations
  const registrationsQuery = `
    SELECT id, full_name, email, phone, tickets_count, total_amount, registration_date
    FROM registrations
    WHERE event_id = ?
    ORDER BY registration_date DESC
  `;
  
  connection.query(eventQuery, [eventId], (err, eventResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (eventResults.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = eventResults[0];
    
    // Fetch registrations for this event
    connection.query(registrationsQuery, [eventId], (err, registrations) => {
      if (err) return res.status(500).json({ error: err.message });
      
      event.registrations = registrations;
      res.json(event);
    });
  });
});

// Create a new registration for an event
app.post('/api/registrations', (req, res) => {
  const { event_id, full_name, email, phone, tickets_count } = req.body;
  
  // Validate required fields
  if (!event_id || !full_name || !email || !tickets_count) {
    return res.status(400).json({ 
      error: 'Missing required fields: event_id, full_name, email, tickets_count' 
    });
  }
  
  // Get event details to calculate total amount
  const eventQuery = 'SELECT ticket_price, current_amount FROM events WHERE id = ?';
  
  connection.query(eventQuery, [event_id], (err, eventResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (eventResults.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResults[0];
    const total_amount = event.ticket_price * tickets_count;
    
    // Insert registration record
    const insertQuery = `
      INSERT INTO registrations (event_id, full_name, email, phone, tickets_count, total_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(
      insertQuery, 
      [event_id, full_name, email, phone || null, tickets_count, total_amount],
      (err, result) => {
        if (err) {
          // Check for duplicate registration
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
              error: 'You have already registered for this event' 
            });
          }
          return res.status(500).json({ error: err.message });
        }
        
        // Update event's current fundraising amount
        const updateEventQuery = `
          UPDATE events 
          SET current_amount = current_amount + ? 
          WHERE id = ?
        `;
        
        connection.query(updateEventQuery, [total_amount, event_id], (err) => {
          if (err) console.error('Failed to update event amount:', err);
          
          res.status(201).json({ 
            message: 'Registration successful',
            registration_id: result.insertId,
            total_amount: total_amount
          });
        });
      }
    );
  });
});

// Weather API proxy (fetches data from Open-Meteo)
app.get('/api/weather', async (req, res) => {
  const { latitude, longitude, date } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    // Dynamic import for node-fetch (ES module)
    const fetch = (await import('node-fetch')).default;
    
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Australia%2FSydney`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// ============================================
// Admin API endpoints
// ============================================

// Get all events with registration count (for admin dashboard)
app.get('/api/admin/events', (req, res) => {
  const query = `
    SELECT e.*, c.name AS category_name,
    (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) AS registration_count
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    ORDER BY e.date DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create a new event
app.post('/api/events', (req, res) => {
  const { 
    name, description, date, location, latitude, longitude,
    ticket_price, goal_amount, category_id 
  } = req.body;
  
  // Validate required fields
  if (!name || !date || !location || !category_id) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, date, location, category_id' 
    });
  }
  
  const query = `
    INSERT INTO events 
    (name, description, date, location, latitude, longitude, ticket_price, goal_amount, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    name, 
    description || null, 
    date, 
    location, 
    latitude || null, 
    longitude || null,
    ticket_price || 0, 
    goal_amount || 0, 
    category_id
  ];
  
  connection.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.status(201).json({ 
      message: 'Event created successfully',
      event_id: result.insertId 
    });
  });
});

// Update an existing event
app.put('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  const { 
    name, description, date, location, latitude, longitude,
    ticket_price, goal_amount, category_id, is_active 
  } = req.body;
  
  const query = `
    UPDATE events 
    SET name = ?, description = ?, date = ?, location = ?, 
        latitude = ?, longitude = ?, ticket_price = ?, 
        goal_amount = ?, category_id = ?, is_active = ?
    WHERE id = ?
  `;
  
  const values = [
    name, description, date, location, latitude, longitude,
    ticket_price, goal_amount, category_id, is_active !== undefined ? is_active : 1,
    eventId
  ];
  
  connection.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event updated successfully' });
  });
});

// Delete an event (only if no registrations exist)
app.delete('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  // Check if event has any registrations
  const checkQuery = 'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?';
  
  connection.query(checkQuery, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const registrationCount = results[0].count;
    
    // Prevent deletion if registrations exist
    if (registrationCount > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete event with existing registrations',
        registration_count: registrationCount
      });
    }
    
    // Delete event
    const deleteQuery = 'DELETE FROM events WHERE id = ?';
    
    connection.query(deleteQuery, [eventId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json({ message: 'Event deleted successfully' });
    });
  });
});

// ============================================
// Static file serving
// ============================================

// Serve client application
app.use('/client', express.static(path.join(__dirname, '..', 'client-angular', 'dist', 'client-angular', 'browser')));

// Serve admin application
app.use('/admin', express.static(path.join(__dirname, '..', 'admin-angular', 'dist', 'admin-angular', 'browser')));

// Default route redirects to client
app.get('/', (req, res) => {
  res.redirect('/client');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Client app: http://localhost:${port}/client`);
  console.log(`Admin app: http://localhost:${port}/admin`);
});