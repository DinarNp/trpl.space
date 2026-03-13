const API_BASE = '/api';

const urlParams = new URLSearchParams(window.location.search);
const shortName = urlParams.get('shortName');

const loading = document.getElementById('loading');
const lecturerContent = document.getElementById('lecturerContent');
const adminLink = document.getElementById('adminLink');

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

  const positions = lecturer.functionalPosition || lecturer.structuralPosition
    ? `${lecturer.functionalPosition || ''} ${lecturer.structuralPosition ? '• ' + lecturer.structuralPosition : ''}`
    : 'Lecturer';

  const educationCount = lecturer.educations?.length || 0;
  const labCount = lecturer.labs?.length || 0;
  const projectCount = lecturer.projects?.length || 0;
  
  const publications = [];
  if (lecturer.googleScholar) publications.push({ name: 'Scholar', url: lecturer.googleScholar, icon: '🎓' });
  if (lecturer.scopus) publications.push({ name: 'Scopus', url: lecturer.scopus, icon: '📊' });
  if (lecturer.sinta) publications.push({ name: 'SINTA', url: lecturer.sinta, icon: '📈' });
  if (lecturer.academicStaffUGM) publications.push({ name: 'UGM', url: lecturer.academicStaffUGM, icon: '🏛️' });

  // Education Timeline
  const educationHTML = lecturer.educations && lecturer.educations.length > 0
    ? lecturer.educations.map(edu => `
      <div class="timeline-item-dash">
        <div class="timeline-year-dash">${edu.startYear} - ${edu.endYear}</div>
        <div class="timeline-title-dash">${edu.degree} - ${edu.major}</div>
        <div class="timeline-details-dash">
          <strong>${edu.institution}</strong><br>
          ${edu.thesisTitle ? `<em style="margin-top: 0.5rem; display: block; color: var(--text-secondary);">${edu.thesisTitle}</em>` : ''}
        </div>
      </div>
    `).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No education data</p>';

  // Projects Grid
  const projectsHTML = lecturer.projects && lecturer.projects.length > 0
    ? lecturer.projects.map(p => {
        const statusClass = p.project.status === 'active' ? 'active' : 'maintenance';
        return `
          <div class="project-card-dash" onclick="window.location.href='project.html?id=${p.project.id}'">
            <div class="project-header-dash">
              <div class="project-title-dash">${p.project.title}</div>
              <div class="project-status-dash">
                <span class="status-indicator-dash ${statusClass}"></span>
                <span>${p.project.status}</span>
              </div>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
              ${p.project.category || 'Project'}
            </div>
            <div style="color: var(--neon-cyan); font-size: 0.85rem;">
              Click to view details →
            </div>
          </div>
        `;
      }).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No projects available</p>';

  // Research Tags
  const researchTags = lecturer.researchInterest
    ? lecturer.researchInterest.split(',').map(tag => 
        `<span class="tag-dash">${tag.trim()}</span>`
      ).join('')
    : '<p style="color: var(--text-secondary);">No research interests listed</p>';

  lecturerContent.innerHTML = `
    <div class="container dashboard-wrapper">
      <!-- Top Banner -->
      <div class="dashboard-banner">
        <div class="banner-content">
          <div class="lecturer-photo-dash">
            ${photoContent}
          </div>
          <div class="lecturer-info-dash">
            <h1>${lecturer.name}</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 0.5rem;">${positions}</p>
            <p style="color: var(--neon-cyan); font-size: 0.9rem;">✉️ ${lecturer.email}</p>
            <div class="quick-links">
              ${publications.map(pub => `
                <a href="${pub.url}" target="_blank" class="quick-link">
                  <span>${pub.icon}</span>
                  <span>${pub.name}</span>
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Widgets -->
      <div class="dashboard-grid">
        <div class="widget">
          <div class="widget-inner">
            <div class="widget-title">Education</div>
            <div class="widget-value" data-target="${educationCount}">0</div>
            <div class="widget-icon">📚</div>
          </div>
        </div>

        <div class="widget">
          <div class="widget-inner">
            <div class="widget-title">Labs</div>
            <div class="widget-value" data-target="${labCount}">0</div>
            <div class="widget-icon">🔬</div>
          </div>
        </div>

        <div class="widget">
          <div class="widget-inner">
            <div class="widget-title">Projects</div>
            <div class="widget-value" data-target="${projectCount}">0</div>
            <div class="widget-icon">💻</div>
          </div>
        </div>

        <div class="widget progress-widget">
          <div class="widget-inner">
            <div class="widget-title">Academic Progress</div>
            <div class="progress-bars">
              <div class="progress-item">
                <span class="progress-label">S1</span>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: 0%" data-width="100%"></div>
                </div>
                <span class="progress-value">100%</span>
              </div>
              <div class="progress-item">
                <span class="progress-label">S2</span>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: 0%" data-width="100%"></div>
                </div>
                <span class="progress-value">100%</span>
              </div>
              <div class="progress-item">
                <span class="progress-label">S3</span>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: 0%" data-width="${educationCount >= 3 ? '100' : '0'}%"></div>
                </div>
                <span class="progress-value">${educationCount >= 3 ? '100' : '0'}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="widget">
          <div class="widget-inner">
            <div class="widget-title">Publications</div>
            <div class="widget-value" data-target="${publications.length}">0</div>
            <div class="widget-icon">📑</div>
          </div>
        </div>

        <div class="widget tag-cloud-widget">
          <div class="widget-inner">
            <div class="widget-title">Research Interests</div>
            <div class="tag-cloud-dash">
              ${researchTags}
            </div>
          </div>
        </div>
      </div>

      <!-- Education Timeline -->
      <h2 class="section-header-dash">📚 Education History</h2>
      <div class="timeline-dash">
        ${educationHTML}
      </div>

      <!-- Projects -->
      ${lecturer.projects && lecturer.projects.length > 0 ? `
        <h2 class="section-header-dash">💻 Active Projects</h2>
        <div class="projects-grid-dash">
          ${projectsHTML}
        </div>
      ` : ''}

      <!-- Labs -->
      ${lecturer.labs && lecturer.labs.length > 0 ? `
        <h2 class="section-header-dash">🏢 Laboratory Affiliations</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          ${lecturer.labs.map(l => `
            <div style="background: rgba(0, 240, 255, 0.05); border: 2px solid rgba(0, 240, 255, 0.3); border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
              <span style="font-size: 2rem;">🔬</span>
              <div style="color: var(--text-primary); font-weight: 600;">${l.lab.name}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Back Button -->
      <div style="text-align: center;">
        <a href="lecturers.html" class="back-btn-dash">← Back to Lecturers</a>
      </div>
    </div>
  `;

  document.title = `${lecturer.name} - Dashboard - TRPL.SPACE`;

  // Animate widgets
  setTimeout(() => {
    animateCounters();
    animateProgressBars();
  }, 300);
}

function animateCounters() {
  const widgets = document.querySelectorAll('.widget-value');
  widgets.forEach(widget => {
    const target = parseInt(widget.getAttribute('data-target'));
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    
    const counter = setInterval(() => {
      current += step;
      if (current >= target) {
        widget.textContent = target;
        clearInterval(counter);
      } else {
        widget.textContent = Math.floor(current);
      }
    }, 16);
  });
}

function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-bar-fill');
  bars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width');
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100);
  });
}

function showError(message) {
  loading.style.display = 'none';
  lecturerContent.style.display = 'block';
  lecturerContent.innerHTML = `
    <div class="container" style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; color: var(--neon-pink);">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️</h1>
        <h2>${message}</h2>
        <p style="margin-top: 1rem; color: var(--text-secondary);">
          The profile you're looking for doesn't exist.
        </p>
        <a href="lecturers.html" class="back-btn-dash" style="display: inline-block; margin-top: 2rem;">
          ← Back to Lecturers
        </a>
      </div>
    </div>
  `;
}
