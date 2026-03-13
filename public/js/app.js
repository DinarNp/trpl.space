// API Base URL
const API_BASE = '/api';

// State
let allProjects = [];
let currentView = 'grid';
let currentFilter = 'all';

// DOM Elements
const projectsContainer = document.getElementById('projectsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const viewBtns = document.querySelectorAll('.view-btn');
const totalProjectsEl = document.getElementById('totalProjects');
const totalCategoriesEl = document.getElementById('totalCategories');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  loadProjects();
  setupEventListeners();
});

// Check if admin is logged in and show admin menu
function checkAdminLogin() {
  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      adminLink.style.display = 'inline-block';
    }
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // View toggle
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderProjects(allProjects);
    });
  });

  // Category filter
  categoryFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    filterProjects();
  });
}

// Load Projects from API
async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    const data = await response.json();
    
    if (data.success) {
      allProjects = data.data;
      renderProjects(allProjects);
      updateStats();
      populateCategories();
    } else {
      showError('Failed to load projects');
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    showError('Error loading projects');
  }
}

// Render Projects
function renderProjects(projects) {
  if (projects.length === 0) {
    projectsContainer.innerHTML = `
      <div class="no-projects">
        <p>No projects found</p>
      </div>
    `;
    return;
  }

  const viewClass = currentView === 'list' ? 'list-view' : '';
  projectsContainer.className = `projects-grid ${viewClass}`;
  
  projectsContainer.innerHTML = projects.map(project => createProjectCard(project)).join('');
  
  // Add click listeners
  document.querySelectorAll('.project-card').forEach((card, index) => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-view')) {
        window.location.href = `/project.html?id=${projects[index].id}`;
      }
    });
  });

  document.querySelectorAll('.btn-view').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(projects[index].url, '_blank');
    });
  });
}

// Create Project Card HTML
function createProjectCard(project) {
  // Status dengan penjelasan yang jelas
  const statusConfig = {
    active: { text: 'Live', class: 'active', description: '✓ Project sedang berjalan' },
    maintenance: { text: 'Maintenance', class: 'maintenance', description: '⚠ Dalam perbaikan' },
    archived: { text: 'Archived', class: 'archived', description: '📦 Tidak aktif' }
  };
  
  const status = statusConfig[project.status] || statusConfig.active;
  
  // Default color and icon if not set
  const cardColor = project.color || 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(168, 85, 247, 0.1))';
  const cardIcon = project.icon || project.title.charAt(0);
  
  const thumbnailStyle = project.color ? `background: ${cardColor}` : '';
  
  const thumbnailContent = `<div class="project-thumbnail-placeholder">${cardIcon}</div>`;

  const featuredBadge = project.featured 
    ? '<span class="featured-badge">Featured</span>' 
    : '';
  
  const lecturerTags = project.lecturers && project.lecturers.length > 0
    ? `<div class="project-lecturers">
        ${project.lecturers.map(l => `<span class="lecturer-tag">${l.lecturer.shortName}</span>`).join('')}
      </div>`
    : '';

  return `
    <div class="project-card" data-category="${project.category}">
      <div class="project-thumbnail" style="${thumbnailStyle}">
        ${thumbnailContent}
        ${featuredBadge}
      </div>
      <div class="project-content">
        <div class="project-header">
          <div>
            <h3 class="project-title">${project.title}</h3>
            <span class="project-category">${project.category}</span>
          </div>
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
        ${lecturerTags}
        <div class="project-footer">
          <div class="project-status">
            <span class="status-indicator ${status.class}"></span>
            <span>${status.text}</span>
          </div>
          <button class="btn-view">View Project</button>
        </div>
      </div>
    </div>
  `;
}

// Filter Projects
function filterProjects() {
  if (currentFilter === 'all') {
    renderProjects(allProjects);
  } else {
    const filtered = allProjects.filter(p => p.category === currentFilter);
    renderProjects(filtered);
  }
}

// Populate Categories
function populateCategories() {
  const categories = [...new Set(allProjects.map(p => p.category))];
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Update Stats
function updateStats() {
  const totalProjects = allProjects.filter(p => p.status === 'active').length;
  const categories = new Set(allProjects.map(p => p.category));
  
  animateNumber(totalProjectsEl, totalProjects);
  animateNumber(totalCategoriesEl, categories.size);
}

// Animate Number
function animateNumber(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 20);
}

// Show Error
function showError(message) {
  projectsContainer.innerHTML = `
    <div style="text-align: center; padding: 4rem; color: var(--neon-pink);">
      <h3>⚠️ ${message}</h3>
      <p style="margin-top: 1rem; color: var(--text-secondary);">Please try again later</p>
    </div>
  `;
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    // Update active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    this.classList.add('active');
    
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Update active nav on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 150; // Offset for header
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});
