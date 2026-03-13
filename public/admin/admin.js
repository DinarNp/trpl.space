// API Base URL
const API_BASE = '/api';

// State
let allProjects = [];
let allLecturers = [];
let editingProjectId = null;

// DOM Elements
const btnAddProject = document.getElementById('btnAddProject');
const projectModal = document.getElementById('projectModal');
const deleteModal = document.getElementById('deleteModal');
const projectForm = document.getElementById('projectForm');
const tableBody = document.getElementById('tableBody');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancel = document.getElementById('btnCancel');
const btnCloseDeleteModal = document.getElementById('btnCloseDeleteModal');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const modalTitle = document.getElementById('modalTitle');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const btnLogout = document.getElementById('btnLogout');

// Stats Elements
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statMaintenance = document.getElementById('statMaintenance');
const statFeatured = document.getElementById('statFeatured');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!isLoggedIn()) {
    window.location.href = '/admin/login.html';
    return;
  }
  
  loadProjects();
  loadLecturers();
  setupEventListeners();
});

// Authentication check
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

// Logout
function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('loginTime');
  window.location.href = '/admin/login.html';
}

// Setup Event Listeners
function setupEventListeners() {
  btnAddProject.addEventListener('click', () => openModal());
  btnCloseModal.addEventListener('click', () => closeModal());
  btnCancel.addEventListener('click', () => closeModal());
  btnCloseDeleteModal.addEventListener('click', () => closeDeleteModal());
  btnCancelDelete.addEventListener('click', () => closeDeleteModal());
  btnLogout.addEventListener('click', logout);
  projectForm.addEventListener('submit', handleSubmit);

  // Color palette selection
  setupColorPalette();

  // Close modal on outside click
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeModal();
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

// Setup Color Palette
function setupColorPalette() {
  const paletteItems = document.querySelectorAll('.palette-item');
  const colorInput = document.getElementById('color');
  
  paletteItems.forEach(item => {
    item.addEventListener('click', () => {
      const isSelected = item.classList.contains('selected');
      
      // Remove selected class from all items
      paletteItems.forEach(i => i.classList.remove('selected'));
      
      if (isSelected) {
        // Deselect if already selected (toggle off)
        colorInput.value = '';
      } else {
        // Select the clicked item
        item.classList.add('selected');
        
        // Set color value
        const color = item.dataset.color;
        colorInput.value = color;
      }
    });
  });
}

// Load Projects
async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    const data = await response.json();
    
    if (data.success) {
      allProjects = data.data;
      renderTable();
      updateStats();
    } else {
      showToast('Failed to load projects', 'error');
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    showToast('Error loading projects', 'error');
  }
}

// Load Lecturers
async function loadLecturers() {
  try {
    const response = await fetch(`${API_BASE}/lecturers`);
    const data = await response.json();
    
    if (data.success) {
      allLecturers = data.data;
      renderLecturerSelect();
    }
  } catch (error) {
    console.error('Error loading lecturers:', error);
  }
}

// Render Lecturer Select
function renderLecturerSelect() {
  const select = document.getElementById('lecturers');
  if (!select) return;
  
  select.innerHTML = allLecturers.map(lec => 
    `<option value="${lec.id}">${lec.shortName} - ${lec.name}</option>`
  ).join('');
}

// Render Table
function renderTable() {
  if (allProjects.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          No projects yet. Click "Add New Project" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = allProjects.map(project => `
    <tr>
      <td>${project.id}</td>
      <td><strong>${project.title}</strong></td>
      <td>${project.category}</td>
      <td>${project.subdomain}</td>
      <td>
        <span class="status-badge-table status-${project.status}">
          ${project.status}
        </span>
      </td>
      <td>
        ${project.featured ? '<span class="featured-icon">⭐</span>' : '-'}
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="editProject(${project.id})" title="Edit">
            ✏️
          </button>
          <button class="btn-icon delete" onclick="confirmDelete(${project.id})" title="Delete">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Update Stats
function updateStats() {
  const total = allProjects.length;
  const active = allProjects.filter(p => p.status === 'active').length;
  const maintenance = allProjects.filter(p => p.status === 'maintenance').length;
  const featured = allProjects.filter(p => p.featured).length;

  statTotal.textContent = total;
  statActive.textContent = active;
  statMaintenance.textContent = maintenance;
  statFeatured.textContent = featured;
}

// Open Modal
function openModal(project = null) {
  editingProjectId = project ? project.id : null;
  
  if (project) {
    modalTitle.textContent = 'Edit Project';
    document.getElementById('title').value = project.title;
    document.getElementById('description').value = project.description;
    document.getElementById('subdomain').value = project.subdomain;
    document.getElementById('url').value = project.url;
    document.getElementById('category').value = project.category;
    document.getElementById('icon').value = project.icon || '';
    document.getElementById('color').value = project.color || '';
    
    // Select color in palette if match
    if (project.color) {
      const paletteItems = document.querySelectorAll('.palette-item');
      paletteItems.forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.color === project.color) {
          item.classList.add('selected');
        }
      });
    }
    
    // Convert date to YYYY-MM-DD format for date input
    if (project.created) {
      // Parse Indonesian date format to YYYY-MM-DD
      const dateValue = parseIndonesianDate(project.created);
      document.getElementById('created').value = dateValue;
    }
    document.getElementById('tags').value = project.tags.join(', ');
    document.getElementById('status').value = project.status;
    document.getElementById('featured').checked = project.featured;
    
    // Select lecturers
    const lecturerSelect = document.getElementById('lecturers');
    if (lecturerSelect && project.lecturers) {
      Array.from(lecturerSelect.options).forEach(option => {
        option.selected = project.lecturers.some(l => l.lecturerId === parseInt(option.value));
      });
    }
  } else {
    modalTitle.textContent = 'Add New Project';
    projectForm.reset();
    
    // Clear palette selection
    document.querySelectorAll('.palette-item').forEach(item => {
      item.classList.remove('selected');
    });
  }
  
  projectModal.classList.add('active');
}

// Close Modal
function closeModal() {
  projectModal.classList.remove('active');
  projectForm.reset();
  editingProjectId = null;
}

// Parse Indonesian date format to YYYY-MM-DD for date input
function parseIndonesianDate(dateString) {
  // Handle format: "9 Maret 2024" → "2024-03-09"
  const months = {
    'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
    'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
    'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
  };
  
  try {
    const parts = dateString.split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      
      if (month) {
        return `${year}-${month}-${day}`;
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  // Return empty if can't parse
  return '';
}

// Handle Form Submit
async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(projectForm);
  const tags = formData.get('tags').split(',').map(t => t.trim()).filter(t => t);
  
  // Format date to Indonesian format
  let createdDate = formData.get('created');
  if (createdDate) {
    const date = new Date(createdDate);
    createdDate = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Get color value - allow empty string to clear color
  const colorValue = formData.get('color');
  const iconValue = formData.get('icon');
  
  // Get selected lecturers
  const lecturerSelect = document.getElementById('lecturers');
  const selectedLecturers = lecturerSelect ? Array.from(lecturerSelect.selectedOptions).map(opt => parseInt(opt.value)) : [];
  
  const projectData = {
    title: formData.get('title'),
    description: formData.get('description'),
    subdomain: formData.get('subdomain'),
    url: formData.get('url'),
    category: formData.get('category'),
    icon: iconValue || undefined,
    color: colorValue !== null ? colorValue : undefined, // Allow empty string
    created: createdDate || undefined,
    tags: tags,
    status: formData.get('status'),
    featured: formData.get('featured') === 'on',
    lecturerIds: selectedLecturers
  };

  try {
    let response;
    if (editingProjectId) {
      response = await fetch(`${API_BASE}/projects/${editingProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
    } else {
      response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
    }

    const data = await response.json();
    
    if (data.success) {
      showToast(editingProjectId ? 'Project updated successfully!' : 'Project created successfully!', 'success');
      closeModal();
      await loadProjects();
    } else {
      showToast('Failed to save project', 'error');
    }
  } catch (error) {
    console.error('Error saving project:', error);
    showToast('Error saving project', 'error');
  }
}

// Edit Project
function editProject(id) {
  const project = allProjects.find(p => p.id === id);
  if (project) {
    openModal(project);
  }
}

// Confirm Delete
let deleteProjectId = null;
function confirmDelete(id) {
  deleteProjectId = id;
  deleteModal.classList.add('active');
}

// Close Delete Modal
function closeDeleteModal() {
  deleteModal.classList.remove('active');
  deleteProjectId = null;
}

// Delete Project
btnConfirmDelete.addEventListener('click', async () => {
  if (!deleteProjectId) return;

  try {
    const response = await fetch(`${API_BASE}/projects/${deleteProjectId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    
    if (data.success) {
      showToast('Project deleted successfully!', 'success');
      closeDeleteModal();
      await loadProjects();
    } else {
      showToast('Failed to delete project', 'error');
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    showToast('Error deleting project', 'error');
  }
});

// Show Toast
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  toast.style.borderColor = type === 'success' ? 'var(--neon-green)' : 'var(--neon-pink)';
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Make functions global
window.editProject = editProject;
window.confirmDelete = confirmDelete;
