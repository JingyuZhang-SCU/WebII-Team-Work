const express = require('express');
const cors = require('cors');
const path = require('path');
const connection = require('./event_db');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ============================================
// 客户端 API
// ============================================

// 0. 获取所有活动（无实际用途，仅作测试使用）
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



// 1. 首页API：获取所有活跃的未来活动
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

// 2. 搜索API：根据条件筛选活动
app.get('/api/events/search', (req, res) => {
  const { category, location, date } = req.query;
  let query = `
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.is_active = TRUE
  `;
  let params = [];

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

// 3. 获取所有类别
app.get('/api/categories', (req, res) => {
  connection.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 4. 活动详情API（改进版 - 包含注册列表）
app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  // 获取活动详情
  const eventQuery = `
    SELECT e.*, c.name AS category_name 
    FROM events e 
    JOIN categories c ON e.category_id = c.id 
    WHERE e.id = ?
  `;
  
  // 获取该活动的注册列表
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
    
    // 获取注册信息
    connection.query(registrationsQuery, [eventId], (err, registrations) => {
      if (err) return res.status(500).json({ error: err.message });
      
      event.registrations = registrations;
      res.json(event);
    });
  });
});

// 5. 创建注册
app.post('/api/registrations', (req, res) => {
  const { event_id, full_name, email, phone, tickets_count } = req.body;
  
  // 验证必填字段
  if (!event_id || !full_name || !email || !tickets_count) {
    return res.status(400).json({ 
      error: 'Missing required fields: event_id, full_name, email, tickets_count' 
    });
  }
  
  // 首先获取活动信息以计算总金额
  const eventQuery = 'SELECT ticket_price, current_amount FROM events WHERE id = ?';
  
  connection.query(eventQuery, [event_id], (err, eventResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (eventResults.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResults[0];
    const total_amount = event.ticket_price * tickets_count;
    
    // 插入注册记录
    const insertQuery = `
      INSERT INTO registrations (event_id, full_name, email, phone, tickets_count, total_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(
      insertQuery, 
      [event_id, full_name, email, phone || null, tickets_count, total_amount],
      (err, result) => {
        if (err) {
          // 检查是否是重复注册
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
              error: 'You have already registered for this event' 
            });
          }
          return res.status(500).json({ error: err.message });
        }
        
        // 更新活动的当前筹款金额
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

// 6. 天气API代理
app.get('/api/weather', async (req, res) => {
  const { latitude, longitude, date } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    // 使用动态 import 导入 node-fetch
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
// 管理端 API
// ============================================

// 7. 获取所有活动（管理端用）
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

// 8. 创建新活动
app.post('/api/events', (req, res) => {
  const { 
    name, description, date, location, latitude, longitude,
    ticket_price, goal_amount, category_id 
  } = req.body;
  
  // 验证必填字段
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

// 9. 更新活动
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

// 10. 删除活动
app.delete('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  // 首先检查是否有注册记录
  const checkQuery = 'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?';
  
  connection.query(checkQuery, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const registrationCount = results[0].count;
    
    if (registrationCount > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete event with existing registrations',
        registration_count: registrationCount
      });
    }
    
    // 没有注册记录，可以删除
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
// 静态文件服务
// ============================================

// 客户端应用
app.use('/client', express.static(path.join(__dirname, '..', 'client-angular', 'dist', 'client-angular', 'browser')));

// 管理端应用
app.use('/admin', express.static(path.join(__dirname, '..', 'admin-angular', 'dist', 'admin-angular', 'browser')));

// 默认路由
app.get('/', (req, res) => {
  res.redirect('/client');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Client app: http://localhost:${port}/client`);
  console.log(`Admin app: http://localhost:${port}/admin`);
});