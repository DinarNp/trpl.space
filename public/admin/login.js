// API Base URL
const API_BASE = '/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    window.location.href = '/admin/index.html';
  }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    // Call API
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Set session
      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('loginTime', Date.now().toString());
      sessionStorage.setItem('adminUser', JSON.stringify(data.user));
      
      showToast('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = '/admin/index.html';
      }, 1000);
    } else {
      showToast(data.message || 'Invalid username or password!', 'error');
      
      // Clear password
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('An error occurred. Please try again.', 'error');
  }
});

// Check if logged in
function isLoggedIn() {
  const loggedIn = sessionStorage.getItem('adminLoggedIn');
  const loginTime = sessionStorage.getItem('loginTime');
  
  if (!loggedIn || !loginTime) return false;
  
  // Session expires after 24 hours
  const now = Date.now();
  const elapsed = now - parseInt(loginTime);
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  if (elapsed > twentyFourHours) {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('loginTime');
    return false;
  }
  
  return true;
}

// Show Toast
function showToast(message, type = 'error') {
  toastMessage.textContent = message;
  toast.className = 'toast show';
  
  if (type === 'success') {
    toast.classList.add('success');
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.className = 'toast';
    }, 300);
  }, 3000);
}
