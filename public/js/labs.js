const API_BASE = '/api';
let allLabs = [];

const loading = document.getElementById('loading');
const labsContainer = document.getElementById('labsContainer');
const adminLink = document.getElementById('adminLink');

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  loadLabs();
});

function checkAdminLogin() {
  if (adminLink) {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      adminLink.style.display = 'inline-block';
    }
  }
}

async function loadLabs() {
  try {
    loading.style.display = 'block';
    labsContainer.style.display = 'none';

    const response = await fetch(`${API_BASE}/labs`);
    const data = await response.json();

    if (data.success) {
      allLabs = data.data;
      renderLabs();
      labsContainer.style.display = 'grid';
    } else {
      showError('Failed to load labs');
    }
  } catch (error) {
    console.error('Error loading labs:', error);
    showError('Error loading laboratories');
  } finally {
    loading.style.display = 'none';
  }
}

function renderLabs() {
  if (allLabs.length === 0) {
    labsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <h2>No laboratories found</h2>
        <p style="margin-top: 1rem;">Check back later for updates.</p>
      </div>
    `;
    return;
  }

  labsContainer.innerHTML = allLabs.map(lab => createLabCard(lab)).join('');
}

function createLabCard(lab) {
  const memberCount = lab.lecturers?.length || 0;
  const members = lab.lecturers || [];
  
  const memberPreview = members.slice(0, 3).map(m => {
    const lecturer = m.lecturer;
    
    // Convert Google Drive link to direct image link
    let photoUrl = lecturer.photo;
    if (photoUrl && photoUrl.includes('drive.google.com')) {
      const fileIdMatch = photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        photoUrl = `https://lh3.googleusercontent.com/d/${fileId}=w100`;
      }
    }
    
    if (photoUrl) {
      return `<img src="${photoUrl}" alt="${lecturer.name}" loading="lazy" style="width:30px;height:30px;border-radius:50%;border:2px solid var(--neon-cyan);margin-left:-10px;object-fit:cover;object-position:center 10%;" 
        onerror="
          if(!this.retryCount) this.retryCount = 0;
          this.retryCount++;
          if(this.retryCount === 1) {
            this.src = this.src.replace('lh3.googleusercontent.com/d/', 'drive.google.com/thumbnail?id=').replace('=w100', '&sz=w100');
          } else if(this.retryCount === 2) {
            setTimeout(() => { this.src = '${photoUrl}'; this.retryCount = 1; }, 1000);
          } else {
            this.outerHTML='<div style=\\'width:30px;height:30px;border-radius:50%;background:var(--gradient-primary);border:2px solid var(--neon-cyan);margin-left:-10px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;\\'>${lecturer.shortName}</div>';
          }
        ">`;
    }
    return `<div style="width:30px;height:30px;border-radius:50%;background:var(--gradient-primary);border:2px solid var(--neon-cyan);margin-left:-10px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;">${lecturer.shortName}</div>`;
  }).join('');

  const moreMembers = memberCount > 3 ? `<span style="margin-left:0.5rem;color:var(--neon-cyan);font-weight:600;">+${memberCount - 3}</span>` : '';

  return `
    <div class="project-card" style="cursor: default;">
      <div class="project-thumbnail" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(168, 85, 247, 0.15));">
        <div class="project-thumbnail-placeholder" style="font-size: 4rem;">🔬</div>
      </div>
      <div class="project-content">
        <div class="project-header">
          <div>
            <h3 class="project-title">${lab.name}</h3>
          </div>
        </div>
        <p class="project-description">${lab.description}</p>
        
        <div style="margin: 1rem 0;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
            <span>👥</span>
            <span><strong>${memberCount}</strong> Members</span>
          </div>
          ${memberCount > 0 ? `
            <div style="display: flex; align-items: center; margin-left: 1.5rem;">
              ${memberPreview}
              ${moreMembers}
            </div>
          ` : ''}
        </div>

        <div class="project-footer" style="margin-top: auto;">
          <div class="project-status">
            <span class="status-indicator active"></span>
            <span>Active Lab</span>
          </div>
          ${memberCount > 0 ? `<a href="lecturers.html?lab=${lab.id}" class="btn-view" style="text-decoration:none;">View Members</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

function showError(message) {
  loading.style.display = 'none';
  labsContainer.style.display = 'block';
  labsContainer.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--neon-pink);">
      <h2>⚠️ ${message}</h2>
      <p style="margin-top: 1rem; color: var(--text-secondary);">
        Please try again later.
      </p>
    </div>
  `;
}
