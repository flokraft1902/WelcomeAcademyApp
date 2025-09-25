const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, you'd use a database)
let todos = [
  {
    id: 1,
    title: "Learn Node.js",
    description: "Study Express.js and build APIs",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Build a Todo app",
    description: "Create a full-stack todo application",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 3;

// Helper function to find todo by id
const findTodoById = (id) => {
  return todos.find(todo => todo.id === parseInt(id));
};

// Helper function to validate todo data
const validateTodoData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }
  
  return errors;
};

// Routes

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  try {
    const { completed, search } = req.query;
    
    let filteredTodos = todos;
    
    // Filter by completion status if provided
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      filteredTodos = filteredTodos.filter(todo => todo.completed === isCompleted);
    }
    
    // Search in title and description if search term provided
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm))
      );
    }
    
    res.json({
      success: true,
      data: filteredTodos,
      count: filteredTodos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/todos/:id - Get a specific todo
app.get('/api/todos/:id', (req, res) => {
  try {
    const todo = findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
  try {
    const { title, description } = req.body;
    
    const validationErrors = validateTodoData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    const newTodo = {
      id: nextId++,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    
    res.status(201).json({
      success: true,
      data: newTodo,
      message: 'Todo created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/todos/:id - Update an existing todo
app.put('/api/todos/:id', (req, res) => {
  try {
    const todo = findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    const { title, description, completed } = req.body;
    
    // Create updated data object
    const updatedData = {
      title: title !== undefined ? title : todo.title,
      description: description !== undefined ? description : todo.description,
      completed: completed !== undefined ? completed : todo.completed
    };
    
    const validationErrors = validateTodoData(updatedData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Update the todo
    todo.title = updatedData.title.trim();
    todo.description = updatedData.description ? updatedData.description.trim() : '';
    todo.completed = updatedData.completed;
    todo.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: todo,
      message: 'Todo updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/todos/:id/toggle - Toggle completion status
app.patch('/api/todos/:id/toggle', (req, res) => {
  try {
    const todo = findTodoById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: todo,
      message: `Todo marked as ${todo.completed ? 'completed' : 'pending'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  try {
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(req.params.id));
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    
    const deletedTodo = todos.splice(todoIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedTodo,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/todos - Delete all completed todos
app.delete('/api/todos', (req, res) => {
  try {
    const completedTodos = todos.filter(todo => todo.completed);
    todos = todos.filter(todo => !todo.completed);
    
    res.json({
      success: true,
      message: `Deleted ${completedTodos.length} completed todos`,
      deletedCount: completedTodos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Todo API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Todo API server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
