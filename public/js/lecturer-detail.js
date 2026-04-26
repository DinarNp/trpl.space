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
  const rawPhoto = lecturer.photo;
  const proxyUrl = rawPhoto
    ? (rawPhoto.includes('drive.google.com')
        ? `/api/image-proxy?url=${encodeURIComponent(rawPhoto)}`
        : rawPhoto)
    : null;

  const photoContent = proxyUrl
    ? `<img src="${proxyUrl}" alt="${lecturer.name}"
        onerror="this.onerror=null; this.parentElement.innerHTML='<span style=font-size:3rem;font-weight:900>${lecturer.shortName}</span>'">`
    : lecturer.shortName;

  // Positions for sidebar
  const sidebarPositionsHTML = lecturer.functionalPosition
    ? `
      <div class="lecturer-sidebar-position">
        <span class="position-icon">🎓</span>
        <span>${lecturer.functionalPosition}</span>
      </div>
    ` : '';
  
  const positions = [];
  if (lecturer.structuralPosition) positions.push({ icon: '👔', text: lecturer.structuralPosition });
  
  const positionsHTML = positions.length > 0 
    ? `
      <div class="content-positions">
        ${positions.map(p => `
          <span class="position-badge">
            <span class="position-badge-icon">${p.icon}</span>
            <span>${p.text}</span>
          </span>
        `).join('')}
      </div>
    ` : '';

  // Stats
  const labCount = lecturer.labs?.length || 0;
  const projectCount = lecturer.projects?.length || 0;
  const educationCount = lecturer.educations?.length || 0;

  // Education section
  const educationHTML = lecturer.educations && lecturer.educations.length > 0
    ? `
      <div class="lecturer-section">
        <h2 class="section-title-lecturer">
          <span class="section-icon">📚</span>
          Education
        </h2>
        <div class="education-timeline">
          ${lecturer.educations.map(edu => `
            <div class="education-item">
              <div class="education-degree">${edu.degree} - ${edu.major}</div>
              <div class="education-details">
                <strong>${edu.institution}</strong><br>
                ${edu.thesisTitle ? `<em style="color: var(--text-secondary); font-size: 0.95rem;">${edu.thesisTitle}</em><br>` : ''}
                <span class="education-year">${edu.startYear} - ${edu.endYear}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

  // Research interest
  const researchHTML = lecturer.researchInterest
    ? `
      <div class="lecturer-section">
        <h2 class="section-title-lecturer">
          <span class="section-icon">🔬</span>
          Research Interests
        </h2>
        <div class="research-cloud">
          ${lecturer.researchInterest.split(',').map(interest => 
            `<span class="research-tag">${interest.trim()}</span>`
          ).join('')}
        </div>
      </div>
    ` : '';

  // Lab affiliations
  const labsHTML = lecturer.labs && lecturer.labs.length > 0
    ? `
      <div class="lecturer-section">
        <h2 class="section-title-lecturer">
          <span class="section-icon">🏢</span>
          Laboratory Affiliations
        </h2>
        <div class="lab-badges-grid">
          ${lecturer.labs.map(l => `
            <div class="lab-badge-card">
              <span class="lab-icon">🔬</span>
              <div class="lab-name">${l.lab.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

  // Projects
  const projectsHTML = lecturer.projects && lecturer.projects.length > 0
    ? `
      <div class="lecturer-section">
        <h2 class="section-title-lecturer">
          <span class="section-icon">💻</span>
          Projects
        </h2>
        <div class="projects-mini-grid">
          ${lecturer.projects.map(p => {
            const statusClass = p.project.status === 'active' ? 'active' : 
                               p.project.status === 'maintenance' ? 'maintenance' : 'archived';
            return `
              <div class="project-mini-card" onclick="window.location.href='project.html?id=${p.project.id}'">
                <div class="project-mini-title">${p.project.title}</div>
                <span class="project-mini-category">${p.project.category || 'Project'}</span>
                <div class="project-mini-status">
                  <span class="status-indicator ${statusClass}"></span>
                  <span>${p.project.status}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

  // Publications for sidebar with logo images
  const publications = [];
  if (lecturer.googleScholar) publications.push({ 
    name: 'Google Scholar', 
    url: lecturer.googleScholar, 
    logo: 'https://img.icons8.com/color/200/google-scholar--v3.png' 
  });
  if (lecturer.scopus) publications.push({ 
    name: 'Scopus', 
    url: lecturer.scopus, 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Scopus_logo.svg/500px-Scopus_logo.svg.png' 
  });
  if (lecturer.sinta) publications.push({ 
    name: 'SINTA', 
    url: lecturer.sinta, 
    logo: 'https://eastasouth.com/build/assets/pa-sinta-30342996.png' 
  });
  if (lecturer.academicStaffUGM) publications.push({ 
    name: 'UGM', 
    url: lecturer.academicStaffUGM, 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/UNIVERSITAS_GADJAH_MADA%2C_YOGYAKARTA.png' 
  });
  if (lecturer.pddikti) publications.push({ 
    name: 'PDDikti', 
    url: lecturer.pddikti, 
    logo: 'https://fisip.ibi-k57.ac.id/wp-content/uploads/2024/09/PDDIKTI-1024x956-1.png' 
  });

  const sidebarPublications = publications.length > 0
    ? `
      <div class="sidebar-publications">
        <div class="sidebar-pub-title">Academic Profiles</div>
        ${publications.map(pub => `
          <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="sidebar-pub-link">
            <img src="${pub.logo}" alt="${pub.name}" class="sidebar-pub-logo">
            <span>${pub.name}</span>
          </a>
        `).join('')}
      </div>
    ` : '';

  lecturerContent.innerHTML = `
    <div class="container">
      <div class="lecturer-detail-wrapper">
        <!-- Left Sidebar (Sticky) -->
        <aside class="lecturer-sidebar">
          <div class="lecturer-sidebar-card">
            <div class="lecturer-photo-sidebar">
              ${photoContent}
            </div>
            <h1 class="lecturer-sidebar-name">${lecturer.name}</h1>
            <span class="lecturer-sidebar-tag">${lecturer.shortName}</span>
            
            ${sidebarPositionsHTML}
            
            <div class="lecturer-sidebar-email">
              <a href="mailto:${lecturer.email}">
                ✉️ ${lecturer.email}
              </a>
            </div>
            
            ${sidebarPublications}
          </div>
          
          <div style="margin-top: 1.5rem; text-align: center;">
            <a href="lecturers.html" class="btn-view" style="display: inline-block; text-decoration: none; padding: 0.75rem 1.5rem; font-size: 0.9rem;">
              ← Back to Members
            </a>
          </div>
        </aside>
        
        <!-- Right Content (Scrollable) -->
        <main class="lecturer-content">
          ${positionsHTML}
          ${researchHTML}
          ${educationHTML}
          ${labsHTML}
          ${projectsHTML}
        </main>
      </div>
    </div>
  `;

  document.title = `${lecturer.name} - TRPL.SPACE`;
  
  // Animate stat counters
  setTimeout(() => {
    const statNumbers = document.querySelectorAll('.stat-number-mini');
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
  }, 300);
  
  // Add fadeInUp animation to sections
  const sections = document.querySelectorAll('.lecturer-section');
  sections.forEach((section, index) => {
    section.style.animation = `fadeInUp 0.6s ease forwards`;
    section.style.opacity = '0';
    section.style.animationDelay = `${0.2 + index * 0.1}s`;
  });
  
  // Add slide-in animation to sidebar
  const sidebar = document.querySelector('.lecturer-sidebar-card');
  if (sidebar) {
    sidebar.style.animation = 'slideInLeft 0.6s ease forwards';
    sidebar.style.opacity = '0';
  }
  
  // Add CSS for animations
  if (!document.getElementById('lecturer-animations')) {
    const style = document.createElement('style');
    style.id = 'lecturer-animations';
    style.textContent = `
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
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
        <a href="lecturers.html" class="btn-view" style="display: inline-block; margin-top: 2rem; text-decoration: none; padding: 1rem 2rem;">
          ← Back to Members
        </a>
      </div>
    </section>
  `;
}
