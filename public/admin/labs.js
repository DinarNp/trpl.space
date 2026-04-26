// Check authentication
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const loginTime = sessionStorage.getItem('loginTime');
  
  if (!isLoggedIn || !loginTime) {
    window.location.href = 'login.html';
    return false;
  }
  
  // Session expires after 24 hours
  const now = Date.now();
  const elapsed = now - parseInt(loginTime);
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  if (elapsed > twentyFourHours) {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

checkAuth();

const API_URL = '/api';

let labs = [];
let editingLabId = null;
let deletingLabId = null;

// DOM Elements
const loading = document.getElementById('loading');
const labsTableContainer = document.getElementById('labsTableContainer');
const labsTableBody = document.getElementById('labsTableBody');
const addLabBtn = document.getElementById('addLabBtn');
const labModal = document.getElementById('labModal');
const deleteModal = document.getElementById('deleteModal');
const labForm = document.getElementById('labForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');

// Load labs on page load
document.addEventListener('DOMContentLoaded', loadLabs);

// Event listeners
addLabBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', handleDelete);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
labForm.addEventListener('submit', handleSubmit);
logoutBtn.addEventListener('click', handleLogout);

// Close modal when clicking outside
labModal.addEventListener('click', (e) => {
  if (e.target === labModal) closeModal();
});
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

// Load labs from API
async function loadLabs() {
  try {
    loading.style.display = 'block';
    labsTableContainer.style.display = 'none';

    const response = await fetch(`${API_URL}/labs`);
    const data = await response.json();

    if (data.success) {
      labs = data.data;
      renderLabs();
      labsTableContainer.style.display = 'block';
    } else {
      showToast('Failed to load labs', 'error');
    }
  } catch (error) {
    console.error('Error loading labs:', error);
    showToast('Error loading labs', 'error');
  } finally {
    loading.style.display = 'none';
  }
}

// Render labs table
function renderLabs() {
  if (labs.length === 0) {
    labsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          No labs found. Click "Add Lab" to create one.
        </td>
      </tr>
    `;
    return;
  }

  labsTableBody.innerHTML = labs.map(lab => `
    <tr>
      <td>${lab.id}</td>
      <td><strong>${lab.name}</strong></td>
      <td>${lab.description.substring(0, 100)}${lab.description.length > 100 ? '...' : ''}</td>
      <td>${lab.lecturers?.length || 0} lecturers</td>
      <td class="table-actions">
        <button class="btn-edit" onclick="openEditModal(${lab.id})">Edit</button>
        <button class="btn-delete-table" onclick="openDeleteModal(${lab.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Open add modal
function openAddModal() {
  editingLabId = null;
  modalTitle.textContent = 'Add Lab';
  labForm.reset();
  labModal.classList.add('active');
}

// Open edit modal
function openEditModal(id) {
  const lab = labs.find(l => l.id === id);
  if (!lab) return;

  editingLabId = id;
  modalTitle.textContent = 'Edit Lab';

  document.getElementById('labId').value = lab.id;
  document.getElementById('labName').value = lab.name;
  document.getElementById('labDescription').value = lab.description;

  labModal.classList.add('active');
}

// Close modal
function closeModal() {
  labModal.classList.remove('active');
  labForm.reset();
  editingLabId = null;
}

// Open delete modal
function openDeleteModal(id) {
  deletingLabId = id;
  deleteModal.classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
  deleteModal.classList.remove('active');
  deletingLabId = null;
}

// Handle form submit
async function handleSubmit(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('labName').value.trim(),
    description: document.getElementById('labDescription').value.trim(),
  };

  try {
    const url = editingLabId 
      ? `${API_URL}/labs/${editingLabId}`
      : `${API_URL}/labs`;
    
    const method = editingLabId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message, 'success');
      closeModal();
      loadLabs();
    } else {
      showToast(data.message || 'Failed to save lab', 'error');
    }
  } catch (error) {
    console.error('Error saving lab:', error);
    showToast('Error saving lab', 'error');
  }
}

// Handle delete
async function handleDelete() {
  if (!deletingLabId) return;

  try {
    const response = await fetch(`${API_URL}/labs/${deletingLabId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message, 'success');
      closeDeleteModal();
      loadLabs();
    } else {
      showToast(data.message || 'Failed to delete lab', 'error');
    }
  } catch (error) {
    console.error('Error deleting lab:', error);
    showToast('Error deleting lab', 'error');
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('authToken');
  window.location.href = 'login.html';
}

// Show toast notification
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Make functions global for onclick handlers
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
