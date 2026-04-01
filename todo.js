// Array to store active todos
let todos = [];

// Array to store completed tasks history
let history = [];

// Load data from localStorage when page loads
function loadData() {
  try {
    const savedTodos = localStorage.getItem('todos');
    const savedHistory = localStorage.getItem('history');
    
    if (savedTodos) {
      todos = JSON.parse(savedTodos);
    }
    
    if (savedHistory) {
      history = JSON.parse(savedHistory);
    }
    
    console.log('Loaded todos:', todos.length);
    console.log('Loaded history:', history.length);
    
    renderTodos();
    renderHistory();
    updateCounts();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to localStorage
function saveData() {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('history', JSON.stringify(history));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Add new todo
function addTodo() {
  const todoInput = document.querySelector('.input-area .todoinput');
  const dateInput = document.querySelector('.input-area .date-input');
  
  if (!todoInput || !dateInput) {
    console.error('Input elements not found!');
    return;
  }
  
  const taskText = todoInput.value.trim();
  const taskDate = dateInput.value;
  
  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }
  
  const newTodo = {
    id: Date.now(),
    text: taskText,
    date: taskDate || "No date set",
    createdAt: new Date().toLocaleString()
  };
  
  todos.push(newTodo);
  saveData();
  renderTodos();
  updateCounts();
  
  // Clear inputs
  todoInput.value = "";
  dateInput.value = "";
  
  // Focus back on todo input
  todoInput.focus();
  
  console.log('Added new todo:', newTodo);
}

// Complete task (move to history)
function completeTask(id) {
  console.log('Completing task:', id);
  
  const taskIndex = todos.findIndex(todo => todo.id === id);
  
  if (taskIndex !== -1) {
    const completedTask = { ...todos[taskIndex] }; // Create a copy
    completedTask.completedAt = new Date().toLocaleString();
    history.unshift(completedTask); // Add to history (newest first)
    todos.splice(taskIndex, 1);
    saveData();
    renderTodos();
    renderHistory();
    updateCounts();
    console.log('Task completed, history length:', history.length);
  } else {
    console.error('Task not found:', id);
  }
}

// Delete task permanently
function deleteTask(id, isHistory = false) {
  console.log('Deleting task:', id, 'from history:', isHistory);
  
  if (isHistory) {
    history = history.filter(task => task.id !== id);
    renderHistory();
  } else {
    todos = todos.filter(task => task.id !== id);
    renderTodos();
  }
  
  saveData();
  updateCounts();
}

// Restore task from history
function restoreTask(id) {
  console.log('Restoring task:', id);
  
  const taskIndex = history.findIndex(task => task.id === id);
  
  if (taskIndex !== -1) {
    const restoredTask = { ...history[taskIndex] };
    delete restoredTask.completedAt;
    todos.push(restoredTask);
    history.splice(taskIndex, 1);
    saveData();
    renderTodos();
    renderHistory();
    updateCounts();
    console.log('Task restored, active tasks:', todos.length);
  } else {
    console.error('Task not found in history:', id);
  }
}

// Clear all history
function clearHistory() {
  if (history.length > 0 && confirm("Are you sure you want to clear all history?")) {
    history = [];
    saveData();
    renderHistory();
    updateCounts();
    console.log('History cleared');
  }
}

// Render active todos
function renderTodos() {
  const todoContainer = document.getElementById('todo-container');
  
  if (!todoContainer) {
    console.error('Todo container not found!');
    return;
  }
  
  if (todos.length === 0) {
    todoContainer.innerHTML = `
      <div class="empty-state">
        <p>🎯</p>
        <p>No active tasks</p>
        <p>Add a new task to get started!</p>
      </div>
    `;
    return;
  }
  
  todoContainer.innerHTML = todos.map(todo => `
    <div class="todo-item">
      <div class="task-content">
        <div class="task-text">${escapeHtml(todo.text)}</div>
        <div class="task-date">📅 ${escapeHtml(todo.date)}</div>
        <small style="color: #999; font-size: 10px;">📝 Created: ${todo.createdAt}</small>
      </div>
      <div class="task-actions">
        <button class="complete-btn" onclick="completeTask(${todo.id})">✓ Complete</button>
        <button class="delete-btn" onclick="deleteTask(${todo.id})">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

// Render history tasks
function renderHistory() {
  const historyContainer = document.getElementById('history-container');
  
  if (!historyContainer) {
    console.error('History container not found!');
    return;
  }
  
  console.log('Rendering history, items:', history.length);
  
  if (history.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        <p>✨</p>
        <p>No completed tasks yet</p>
        <p>Complete tasks to see them here!</p>
      </div>
    `;
    return;
  }
  
  historyContainer.innerHTML = history.map(task => `
    <div class="history-item">
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-date">📅 ${escapeHtml(task.date)}</div>
        <small style="color: #999; font-size: 10px;">
          ✅ Completed: ${task.completedAt}
        </small>
        <small style="color: #999; font-size: 10px; display: block; margin-top: 2px;">
          📝 Created: ${task.createdAt}
        </small>
      </div>
      <div class="task-actions">
        <button class="restore-btn" onclick="restoreTask(${task.id})">↩️ Restore</button>
        <button class="delete-btn" onclick="deleteTask(${task.id}, true)">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

// Update task counts
function updateCounts() {
  const activeCount = document.getElementById('active-count');
  const historyCount = document.getElementById('history-count');
  
  if (activeCount) {
    activeCount.textContent = todos.length;
  }
  if (historyCount) {
    historyCount.textContent = history.length;
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, initializing app...');
  loadData();
  
  const todoInput = document.querySelector('.input-area .todoinput');
  if (todoInput) {
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTodo();
      }
    });
  }
});

// Make functions available globally
window.addTodo = addTodo;
window.completeTask = completeTask;
window.deleteTask = deleteTask;
window.restoreTask = restoreTask;
window.clearHistory = clearHistory;