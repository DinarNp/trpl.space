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
  const heroBackground = lecturer.photo 
    ? `background-image: url('${lecturer.photo}');`
    : `background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(168, 85, 247, 0.3));`;

  const positions = [];
  if (lecturer.functionalPosition) positions.push(lecturer.functionalPosition);
  if (lecturer.structuralPosition) positions.push(lecturer.structuralPosition);

  const educationCount = lecturer.educations?.length || 0;
  const labCount = lecturer.labs?.length || 0;
  const projectCount = lecturer.projects?.length || 0;
  
  const publications = [];
  if (lecturer.googleScholar) publications.push({ 
    name: 'Google Scholar', 
    url: lecturer.googleScholar, 
    icon: '🎓',
    desc: 'Academic publications and citations'
  });
  if (lecturer.scopus) publications.push({ 
    name: 'Scopus', 
    url: lecturer.scopus, 
    icon: '📊',
    desc: 'Research metrics and papers'
  });
  if (lecturer.sinta) publications.push({ 
    name: 'SINTA', 
    url: lecturer.sinta, 
    icon: '📈',
    desc: 'Indonesian research database'
  });
  if (lecturer.academicStaffUGM) publications.push({ 
    name: 'Academic Staff UGM', 
    url: lecturer.academicStaffUGM, 
    icon: '🏛️',
    desc: 'University staff profile'
  });
  if (lecturer.pddikti) publications.push({ 
    name: 'PDDikti', 
    url: lecturer.pddikti, 
    icon: '📖',
    desc: 'National higher education database'
  });

  // Pull quote from research interest
  const pullQuote = lecturer.researchInterest 
    ? lecturer.researchInterest.split(',')[0].trim()
    : 'Passionate about advancing technology and education';

  // Education Timeline
  const educationHTML = lecturer.educations && lecturer.educations.length > 0
    ? lecturer.educations.map(edu => `
      <div class="education-item-mag">
        <div class="education-year-badge">
          ${edu.startYear}<br>-<br>${edu.endYear}
        </div>
        <div class="education-content-mag">
          <div class="education-degree-mag">${edu.degree} - ${edu.major}</div>
          <div class="education-details-mag">
            <strong>${edu.institution}</strong><br>
            ${edu.thesisTitle ? `<em style="margin-top: 0.5rem; display: block;">${edu.thesisTitle}</em>` : ''}
          </div>
        </div>
      </div>
    `).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No education data</p>';

  // Featured Projects
  const featuredProjectsHTML = lecturer.projects && lecturer.projects.length > 0
    ? lecturer.projects.slice(0, 3).map(p => {
        const statusClass = p.project.status === 'active' ? 'active' : '';
        return `
          <div class="project-feature-card" onclick="window.location.href='project.html?id=${p.project.id}'">
            <div class="project-feature-image">
              ${p.project.icon || '💻'}
            </div>
            <div class="project-feature-content">
              <div class="project-feature-title">${p.project.title}</div>
              <div class="project-feature-desc">${p.project.description?.substring(0, 100) || 'Click to view project details'}...</div>
              <div class="project-feature-meta">
                <span class="project-feature-category">${p.project.category || 'Project'}</span>
                <div class="project-feature-status">
                  <span class="status-dot-mag ${statusClass}"></span>
                  <span>${p.project.status || 'active'}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')
    : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No projects available</p>';

  // Publications
  const publicationsHTML = publications.length > 0
    ? publications.map(pub => `
      <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="publication-item-mag">
        <span class="publication-icon-mag">${pub.icon}</span>
        <div class="publication-content-mag">
          <div class="publication-name-mag">${pub.name}</div>
          <div class="publication-desc-mag">${pub.desc}</div>
        </div>
      </a>
    `).join('')
    : '<p style="color: var(--text-secondary);">No publications listed</p>';

  lecturerContent.innerHTML = `
    <!-- Hero Banner with Photo Background -->
    <section class="magazine-hero">
      <div class="magazine-hero-bg" style="${heroBackground}"></div>
      <div class="magazine-hero-content container">
        <h1 class="magazine-title">${lecturer.name}</h1>
        <div class="magazine-subtitle">${positions.join(' • ') || 'Lecturer & Researcher'}</div>
        <div class="magazine-tags">
          <span class="magazine-tag">${lecturer.shortName}</span>
          ${lecturer.email ? `<span class="magazine-tag">✉️ ${lecturer.email}</span>` : ''}
        </div>
      </div>
    </section>

    <div class="container">
      <!-- Pull Quote -->
      ${lecturer.researchInterest ? `
        <section class="pull-quote-section">
          <div class="pull-quote">
            <div class="pull-quote-text">"${pullQuote}"</div>
            <div class="pull-quote-author">— ${lecturer.name}</div>
          </div>
        </section>
      ` : ''}

      <!-- Stats Bar -->
      <div class="stats-bar-mag">
        <div class="stat-item-mag">
          <span class="stat-value-mag" data-target="${educationCount}">0</span>
          <span class="stat-label-mag">Degrees</span>
        </div>
        <div class="stat-item-mag">
          <span class="stat-value-mag" data-target="${labCount}">0</span>
          <span class="stat-label-mag">Laboratories</span>
        </div>
        <div class="stat-item-mag">
          <span class="stat-value-mag" data-target="${projectCount}">0</span>
          <span class="stat-label-mag">Projects</span>
        </div>
        <div class="stat-item-mag">
          <span class="stat-value-mag" data-target="${publications.length}">0</span>
          <span class="stat-label-mag">Publications</span>
        </div>
      </div>

      <!-- Two-Column Content -->
      <div class="magazine-content">
        <!-- Left Column: Education & Projects -->
        <div class="content-column">
          <h2 class="section-header-mag">📚 Academic Journey</h2>
          <div class="feature-box">
            <div class="feature-box-inner">
              ${educationHTML}
            </div>
          </div>

          <h2 class="section-header-mag">💻 Featured Projects</h2>
          ${featuredProjectsHTML}
        </div>

        <!-- Right Column: Publications & Labs -->
        <div class="content-column">
          <h2 class="section-header-mag">📑 Academic Profiles</h2>
          <div class="publications-mag">
            ${publicationsHTML}
          </div>

          ${lecturer.labs && lecturer.labs.length > 0 ? `
            <h2 class="section-header-mag" style="margin-top: 3rem;">🏢 Research Labs</h2>
            <div class="feature-box">
              <div class="feature-box-inner">
                ${lecturer.labs.map(l => `
                  <div style="padding: 1rem; margin-bottom: 1rem; background: rgba(0, 240, 255, 0.05); border-left: 4px solid var(--neon-cyan); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <span style="font-size: 2rem;">🔬</span>
                      <div>
                        <div style="color: var(--text-primary); font-weight: 700; font-size: 1.1rem;">${l.lab.name}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Active Member</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${lecturer.researchInterest ? `
            <h2 class="section-header-mag" style="margin-top: 3rem;">🔬 Research Focus</h2>
            <div class="feature-box">
              <div class="feature-box-inner">
                <p style="color: var(--text-secondary); line-height: 1.8; font-size: 1.1rem;">
                  ${lecturer.researchInterest}
                </p>
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Back Button -->
      <div style="text-align: center; margin: 4rem 0;">
        <a href="lecturers.html" class="back-btn-mag">
          <span>← Back to Lecturers</span>
        </a>
      </div>
    </div>
  `;

  document.title = `${lecturer.name} - Magazine - TRPL.SPACE`;

  // Animate stats
  setTimeout(() => {
    animateCounters();
  }, 300);

  // Parallax effect on scroll
  window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.magazine-hero-bg');
    if (heroBg) {
      const scrolled = window.pageYOffset;
      heroBg.style.transform = `scale(1.1) translateY(${scrolled * 0.5}px)`;
    }
  });
}

function animateCounters() {
  const statValues = document.querySelectorAll('.stat-value-mag');
  statValues.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    const duration = 2000;
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
    <div class="container" style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; color: var(--neon-pink);">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️</h1>
        <h2>${message}</h2>
        <p style="margin-top: 1rem; color: var(--text-secondary);">
          The profile you're looking for doesn't exist.
        </p>
        <a href="lecturers.html" class="back-btn-mag" style="display: inline-block; margin-top: 2rem;">
          <span>← Back to Lecturers</span>
        </a>
      </div>
    </div>
  `;
}
