const http = require('http');
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todo',
  password: 'root',
  port: 5432,
});

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  // Allow cross-origin requests by adding CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (url.pathname === '/api/tasks' && method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM tasks');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error' }));
    }
  }

  else if (url.pathname === '/api/tasks' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const { text } = JSON.parse(body);
      try {
        await pool.query('INSERT INTO tasks (text, completed) VALUES ($1, $2)', [text, false]);
        res.writeHead(201);
        res.end('Task added');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database error' }));
      }
    });
  }

  else if (url.pathname.startsWith('/api/tasks/') && method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    if (!id) {
      res.writeHead(400);
      return res.end('ID required');
    }
    try {
      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      res.writeHead(200);
      res.end('Task deleted');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error' }));
    }
  }

  else if (url.pathname.startsWith('/api/tasks/') && url.pathname.endsWith('/toggle') && method === 'PATCH') {
    const id = url.pathname.split('/')[3];
    if (!id) {
      res.writeHead(400);
      return res.end('ID required');
    }
    try {
      await pool.query('UPDATE tasks SET completed = NOT completed WHERE id = $1', [id]);
      res.writeHead(200);
      res.end('Task toggled');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error' }));
    }
  }

  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
