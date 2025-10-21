const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'form_builder',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Helper functions
function validateFormStructure(formStructure) {
  if (!formStructure || typeof formStructure !== 'object') {
    return { valid: false, error: 'Form structure must be an object' };
  }
  if (!formStructure.questions || !Array.isArray(formStructure.questions)) {
    return { valid: false, error: 'Form structure must have a questions array' };
  }
  return { valid: true };
}

// =============================================================================
// MASTER QUESTIONS API
// =============================================================================

// GET /api/master-questions
app.get('/api/master-questions', async (req, res) => {
  try {
    const { tags, type, search } = req.query;
    
    let query = 'SELECT * FROM master_questions WHERE is_active = true';
    const params = [];
    
    if (tags) {
      query += ' AND tags && $' + (params.length + 1);
      params.push(tags.split(','));
    }
    
    if (type) {
      query += ' AND type = $' + (params.length + 1);
      params.push(type);
    }
    
    if (search) {
      query += ' AND text ILIKE $' + (params.length + 1);
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching master questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/master-questions
app.post('/api/master-questions', async (req, res) => {
  try {
    const { text, type, options, max_selections, tags } = req.body;
    
    if (!text || !type) {
      return res.status(400).json({ error: 'Text and type are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO master_questions (text, type, options, max_selections, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [text, type, options ? JSON.stringify(options) : null, max_selections, tags]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating master question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// FORMS API
// =============================================================================

// GET /api/forms/:tenantId
app.get('/api/forms/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { tags, search } = req.query;
    
    let query = 'SELECT * FROM forms WHERE tenant_id = $1 AND is_active = true';
    const params = [tenantId];
    
    if (tags) {
      query += ' AND tags && $' + (params.length + 1);
      params.push(tags.split(','));
    }
    
    if (search) {
      query += ' AND name ILIKE $' + (params.length + 1);
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY updated_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/forms/:tenantId/:formId
app.get('/api/forms/:tenantId/:formId', async (req, res) => {
  try {
    const { tenantId, formId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM forms WHERE id = $1 AND tenant_id = $2 AND is_active = true',
      [formId, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/forms
app.post('/api/forms', async (req, res) => {
  try {
    const { name, tenantId, tags, form_structure, created_by } = req.body;
    
    if (!name || !tenantId || !form_structure) {
      return res.status(400).json({ error: 'Name, tenantId, and form_structure are required' });
    }
    
    const validation = validateFormStructure(form_structure);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const result = await pool.query(
      'INSERT INTO forms (name, tenant_id, tags, form_structure, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, tenantId, tags, JSON.stringify(form_structure), created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Form name already exists for this tenant' });
    }
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/forms/:tenantId/:formId
app.put('/api/forms/:tenantId/:formId', async (req, res) => {
  try {
    const { tenantId, formId } = req.params;
    const { name, tags, form_structure } = req.body;
    
    const result = await pool.query(
      'UPDATE forms SET name = $1, tags = $2, form_structure = $3, updated_at = NOW() WHERE id = $4 AND tenant_id = $5 RETURNING *',
      [name, tags, JSON.stringify(form_structure), formId, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// FORM RESPONSES API
// =============================================================================

// POST /api/forms/:tenantId/:formId/responses
app.post('/api/forms/:tenantId/:formId/responses', async (req, res) => {
  try {
    const { tenantId, formId } = req.params;
    const { user_id, session_id, responses, is_complete } = req.body;
    
    if (!responses) {
      return res.status(400).json({ error: 'Responses are required' });
    }
    
    // Verify form exists
    const formResult = await pool.query(
      'SELECT id FROM forms WHERE id = $1 AND tenant_id = $2 AND is_active = true',
      [formId, tenantId]
    );
    
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const result = await pool.query(
      'INSERT INTO form_responses (form_id, tenant_id, user_id, session_id, responses, is_complete, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [formId, tenantId, user_id, session_id, JSON.stringify(responses), is_complete || false, req.ip, req.get('User-Agent')]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting form response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/forms/:tenantId/:formId/responses
app.get('/api/forms/:tenantId/:formId/responses', async (req, res) => {
  try {
    const { tenantId, formId } = req.params;
    const { page = 1, limit = 50, is_complete, user_id } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM form_responses WHERE form_id = $1 AND tenant_id = $2';
    const params = [formId, tenantId];
    
    if (is_complete !== undefined) {
      query += ' AND is_complete = $' + (params.length + 1);
      params.push(is_complete === 'true');
    }
    
    if (user_id) {
      query += ' AND user_id = $' + (params.length + 1);
      params.push(user_id);
    }
    
    query += ' ORDER BY submitted_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM form_responses WHERE form_id = $1 AND tenant_id = $2',
      [formId, tenantId]
    );
    
    res.json({
      responses: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching form responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Form Builder API running on port ${PORT}`);
  console.log(`📚 Health Check: GET http://localhost:${PORT}/health`);
  console.log(`📝 Master Questions: GET http://localhost:${PORT}/api/master-questions`);
  console.log(`🗂️  Forms: GET http://localhost:${PORT}/api/forms/:tenantId`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

module.exports = app;