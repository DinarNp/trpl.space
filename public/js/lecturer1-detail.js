const API_BASE = '/api';

const urlParams = new URLSearchParams(window.location.search);
const shortName = urlParams.get('shortName');

const loading = document.getElementById('loading');
const lecturerContent = document.getElementById('lecturerContent');
const adminLink = document.getElementById('adminLink');

let currentTab = 'education';

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  if (shortName) {
    loadLecturerDetail(shortName);
  } else {
    showError('Lecturer not found');
  }
});

function checkAdminLogin() {
  if (adminLink) {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      adminLink.style.display = 'inline-block';
    }
  }
}

async function loadLecturerDetail(shortName) {
  try {
    loading.style.display = 'flex';
    lecturerContent.style.display = 'none';

    const response = await fetch(`${API_BASE}/lecturers/short/${shortName}`);
    const data = await response.json();

    if (data.success && data.data) {
      renderLecturerDetail(data.data);
      lecturerContent.style.display = 'block';
    } else {
      showError('Lecturer not found');
    }
  } catch (error) {
    console.error('Error loading lecturer:', error);
    showError('Error loading lecturer profile');
  } finally {
    loading.style.display = 'none';
  }
}

function renderLecturerDetail(lecturer) {
  const photoContent = lecturer.photo 
    ? `<img src="${lecturer.photo}" alt="${lecturer.name}">`
    : lecturer.shortName;

  const positions = [];
  if (lecturer.functionalPosition) positions.push({ icon: '🎓', text: lecturer.functionalPosition });
  if (lecturer.structuralPosition) positions.push({ icon: '👔', text: lecturer.structuralPosition });

  const educationCount = lecturer.educations?.length || 0;
  const labCount = lecturer.labs?.length || 0;
  const projectCount = lecturer.projects?.length || 0;
  
  const publications = [];
  if (lecturer.googleScholar) publications.push({ name: 'Google Scholar', url: lecturer.googleScholar, icon: '🎓' });
  if (lecturer.scopus) publications.push({ name: 'Scopus', url: lecturer.scopus, icon: '📊' });
  if (lecturer.sinta) publications.push({ name: 'SINTA', url: lecturer.sinta, icon: '📈' });
  if (lecturer.academicStaffUGM) publications.push({ name: 'UGM', url: lecturer.academicStaffUGM, icon: '🏛️' });
  if (lecturer.pddikti) publications.push({ name: 'PDDikti', url: lecturer.pddikti, icon: '📖' });

  // Education Tab Content
  const educationHTML = lecturer.educations && lecturer.educations.length > 0
    ? lecturer.educations.map(edu => `
      <div class="education-item-tab">
        <div class="education-year-tab">${edu.startYear} - ${edu.endYear}</div>
        <div class="education-degree-tab">${edu.degree} - ${edu.major}</div>
        <div class="education-details-tab">
          <strong>${edu.institution}</strong><br>
          ${edu.thesisTitle ? `<em style="color: var(--text-secondary); margin-top: 0.5rem; display: block;">${edu.thesisTitle}</em>` : ''}
        </div>
      </div>
    `).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No education data available</p>';

  // Research Tab Content
  const researchHTML = lecturer.researchInterest
    ? lecturer.researchInterest.split(',').map(interest => 
        `<span class="research-tag-tab">${interest.trim()}</span>`
      ).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No research interests listed</p>';

  // Projects Tab Content
  const projectsHTML = lecturer.projects && lecturer.projects.length > 0
    ? lecturer.projects.map(p => {
        const statusClass = p.project.status === 'active' ? 'active' : '';
        return `
          <div class="project-card-tab" onclick="window.location.href='project.html?id=${p.project.id}'">
            <div class="project-title-tab">${p.project.title}</div>
            <span class="project-category-tab">${p.project.category || 'Project'}</span>
            <div class="project-status-tab">
              <span class="status-dot ${statusClass}"></span>
              <span>${p.project.status || 'active'}</span>
            </div>
          </div>
        `;
      }).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No projects available</p>';

  // Publications Tab Content
  const publicationsHTML = publications.length > 0
    ? publications.map(pub => `
      <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="publication-link-tab">
        <span class="publication-icon-tab">${pub.icon}</span>
        <span>${pub.name}</span>
      </a>
    `).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No publications listed</p>';

  // Labs Tab Content
  const labsHTML = lecturer.labs && lecturer.labs.length > 0
    ? lecturer.labs.map(l => `
      <div class="lab-card-tab">
        <span class="lab-icon-tab">🔬</span>
        <div class="lab-name">${l.lab.name}</div>
      </div>
    `).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No lab affiliations</p>';

  lecturerContent.innerHTML = `
    <div class="container">
      <!-- Hero Card with Rotating Border -->
      <section class="hero-card-container">
        <div class="hero-card">
          <div class="hero-card-inner">
            <div class="lecturer-photo-hero">
              ${photoContent}
            </div>
            <div class="lecturer-info-hero">
              <h1 class="lecturer-name-hero">${lecturer.name}</h1>
              <span class="lecturer-tag-badge">${lecturer.shortName}</span>
              <div class="lecturer-positions-hero">
                ${positions.map(p => `
                  <span class="position-badge-hero">
                    <span>${p.icon}</span>
                    <span>${p.text}</span>
                  </span>
                `).join('')}
              </div>
              <a href="mailto:${lecturer.email}" class="email-link-hero">
                ✉️ ${lecturer.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="stats-grid">
        <div class="stat-card">
          <span class="stat-number" data-target="${educationCount}">0</span>
          <span class="stat-label">Degrees</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" data-target="${labCount}">0</span>
          <span class="stat-label">Labs</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" data-target="${projectCount}">0</span>
          <span class="stat-label">Projects</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" data-target="${publications.length}">0</span>
          <span class="stat-label">Publications</span>
        </div>
      </section>

      <!-- Tabs Navigation -->
      <section class="tabs-container">
        <div class="tabs-nav">
          <button class="tab-button active" data-tab="education">
            <span class="tab-icon">📚</span> Education
          </button>
          <button class="tab-button" data-tab="research">
            <span class="tab-icon">🔬</span> Research
          </button>
          <button class="tab-button" data-tab="projects">
            <span class="tab-icon">💻</span> Projects
          </button>
          <button class="tab-button" data-tab="labs">
            <span class="tab-icon">🏢</span> Labs
          </button>
          <button class="tab-button" data-tab="publications">
            <span class="tab-icon">📑</span> Publications
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="tab-content active" id="tab-education">
          <div class="education-timeline">
            ${educationHTML}
          </div>
        </div>

        <div class="tab-content" id="tab-research">
          <div class="research-cloud-tab">
            ${researchHTML}
          </div>
        </div>

        <div class="tab-content" id="tab-projects">
          <div class="projects-grid-tab">
            ${projectsHTML}
          </div>
        </div>

        <div class="tab-content" id="tab-labs">
          <div class="labs-grid-tab">
            ${labsHTML}
          </div>
        </div>

        <div class="tab-content" id="tab-publications">
          <div class="publications-grid-tab">
            ${publicationsHTML}
          </div>
        </div>
      </section>

      <!-- Back Button -->
      <div class="back-button-container">
        <a href="lecturers.html" class="btn-back-tab">← Back to Lecturers</a>
      </div>
    </div>
  `;

  document.title = `${lecturer.name} - TRPL.SPACE`;

  // Initialize tabs
  initTabs();

  // Animate counters
  setTimeout(() => {
    animateCounters();
  }, 300);
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      // Remove active from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Add active to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });
}

function animateCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    
    const counter = setInterval(() => {
      current += step;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(counter);
      } else {
        stat.textContent = Math.floor(current);
      }
    }, 16);
  });
}

function showError(message) {
  loading.style.display = 'none';
  lecturerContent.style.display = 'block';
  lecturerContent.innerHTML = `
    <section class="container" style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; color: var(--neon-pink);">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️</h1>
        <h2>${message}</h2>
        <p style="margin-top: 1rem; color: var(--text-secondary);">
          The profile you're looking for doesn't exist.
        </p>
        <a href="lecturers.html" class="btn-back-tab" style="display: inline-block; margin-top: 2rem;">
          ← Back to Lecturers
        </a>
      </div>
    </section>
  `;
}
