// API Base URL
const API_BASE = '/api';

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

// DOM Elements
const loadingDetail = document.getElementById('loadingDetail');
const projectContent = document.getElementById('projectContent');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  if (projectId) {
    loadProjectDetail(projectId);
  } else {
    showError('Project ID not found');
  }
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

// Load Project Detail
async function loadProjectDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    const data = await response.json();
    
    if (data.success) {
      renderProjectDetail(data.data);
    } else {
      showError('Project not found');
    }
  } catch (error) {
    console.error('Error loading project:', error);
    showError('Error loading project details');
  }
}

// Convert Google Drive share link to embed URL
function getDriveEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
}

// Render Project Detail
function renderProjectDetail(project) {
  const statusText = project.status === 'active' ? 'Online' : 
                     project.status === 'maintenance' ? 'Maintenance' : 'Archived';
  
  const statusColor = project.status === 'active' ? 'var(--neon-green)' :
                      project.status === 'maintenance' ? 'var(--neon-yellow)' : 
                      'var(--text-secondary)';

  // Use icon and color
  const cardColor = project.color || 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(168, 85, 247, 0.1))';
  const cardIcon = project.icon || project.title.charAt(0);
  const bannerStyle = `background: ${cardColor}`;
  
  const bannerContent = `<div class="detail-banner-placeholder">${cardIcon}</div>`;

  // Use custom created date if available, otherwise use createdAt
  const displayDate = project.created || new Date(project.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  projectContent.innerHTML = `
    <div class="detail-hero">
      <div class="detail-banner" style="${bannerStyle}">
        ${bannerContent}
      </div>
      <div class="detail-content-wrapper">
        <div class="detail-header">
          <div class="detail-title-section">
            <h1 class="detail-title">${project.title}</h1>
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-icon">📂</span>
                <span class="detail-category">${project.category}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🔗</span>
                <span>${project.subdomain}.trpl.space</span>
              </div>
              <div class="detail-status">
                <div class="status-badge">
                  <span class="status-indicator" style="background: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"></span>
                  <span>${statusText}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="detail-actions">
            <a href="${project.url}" target="_blank" class="btn-visit">
              🚀 Visit Project
            </a>
            <a href="/" class="btn-back">
              ← Back to Projects
            </a>
          </div>
        </div>
        
        <p class="detail-description">${project.description}</p>
        
        <div class="detail-tags">
          ${project.tags.map(tag => `<span class="detail-tag">#${tag}</span>`).join('')}
        </div>

        ${project.lecturers && project.lecturers.length > 0 ? `
          <div class="detail-lecturers">
            <h3 style="font-size: 1.2rem; color: var(--neon-cyan); margin-bottom: 1rem;">Team Members</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
              ${project.lecturers.map(l => {
                // Convert Google Drive link to direct image link
                let photoUrl = l.lecturer.photo;
                if (photoUrl && photoUrl.includes('drive.google.com')) {
                  const fileIdMatch = photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                  if (fileIdMatch && fileIdMatch[1]) {
                    const fileId = fileIdMatch[1];
                    photoUrl = `https://lh3.googleusercontent.com/d/${fileId}=w200`;
                  }
                }
                
                const photoContent = photoUrl 
                  ? `<img src="${photoUrl}" alt="${l.lecturer.name}" loading="lazy" 
                      onerror="
                        if(!this.retryCount) this.retryCount = 0;
                        this.retryCount++;
                        if(this.retryCount === 1) {
                          this.src = this.src.replace('lh3.googleusercontent.com/d/', 'drive.google.com/thumbnail?id=').replace('=w200', '&sz=w200');
                        } else if(this.retryCount === 2) {
                          setTimeout(() => { this.src = '${photoUrl}'; this.retryCount = 1; }, 1000);
                        } else {
                          this.parentElement.innerHTML='${l.lecturer.shortName}';
                        }
                      ">`
                  : l.lecturer.shortName;
                
                return `
                  <div class="lecturer-card-mini">
                    <div class="lecturer-avatar">${photoContent}</div>
                    <div class="lecturer-info-mini">
                      <div class="lecturer-name">${l.lecturer.name}</div>
                      <div class="lecturer-position">${l.lecturer.functionalPosition || 'Dosen'}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${(project.pptLink || project.videoLink) ? `
          <div class="detail-media-section">
            ${project.videoLink ? `
              <div class="media-embed-block">
                <h3 class="media-embed-title">🎬 Video Demo</h3>
                <div class="media-embed-wrapper video">
                  <iframe src="${getDriveEmbedUrl(project.videoLink)}"
                    allowfullscreen
                    loading="lazy"
                    frameborder="0">
                  </iframe>
                </div>
              </div>
            ` : ''}
            ${project.pptLink ? `
              <div class="media-embed-block">
                <h3 class="media-embed-title">📊 Presentasi</h3>
                <div class="media-embed-wrapper ppt">
                  <iframe src="${getDriveEmbedUrl(project.pptLink)}"
                    allowfullscreen
                    loading="lazy"
                    frameborder="0">
                  </iframe>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="detail-info-grid">
          <div class="info-card">
            <div class="info-card-title">Subdomain</div>
            <div class="info-card-value">${project.subdomain}</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Category</div>
            <div class="info-card-value">${project.category}</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Status</div>
            <div class="info-card-value">${statusText}</div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Created</div>
            <div class="info-card-value">${displayDate}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update page title
  document.title = `${project.title} - TRPL Lab`;

  // Show content, hide loading
  loadingDetail.style.display = 'none';
  projectContent.style.display = 'block';
}

// Show Error
function showError(message) {
  loadingDetail.style.display = 'none';
  projectContent.style.display = 'block';
  projectContent.innerHTML = `
    <div style="text-align: center; padding: 4rem; color: var(--neon-pink);">
      <h2>⚠️ ${message}</h2>
      <p style="margin-top: 1rem; color: var(--text-secondary);">
        The project you're looking for doesn't exist or has been removed.
      </p>
      <a href="/" class="btn-back" style="display: inline-block; margin-top: 2rem;">
        ← Back to Home
      </a>
    </div>
  `;
}
