const API_BASE = '/api';
let allLecturers = [];
let allLabs = [];
let filteredLecturers = [];

const loading = document.getElementById('loading');
const lecturersContainer = document.getElementById('lecturersContainer');
const searchInput = document.getElementById('searchInput');
const labFilter = document.getElementById('labFilter');
const adminLink = document.getElementById('adminLink');

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  loadData();
  setupFilters();
});

function checkAdminLogin() {
  if (adminLink) {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      adminLink.style.display = 'inline-block';
    }
  }
}

async function loadData() {
  try {
    loading.style.display = 'block';
    lecturersContainer.style.display = 'none';

    const [lecturersRes, labsRes] = await Promise.all([
      fetch(`${API_BASE}/lecturers`),
      fetch(`${API_BASE}/labs`)
    ]);

    const lecturersData = await lecturersRes.json();
    const labsData = await labsRes.json();

    if (lecturersData.success) {
      allLecturers = lecturersData.data;
      filteredLecturers = allLecturers;
    }

    if (labsData.success) {
      allLabs = labsData.data;
      populateLabFilter();
    }

    // Check URL params for lab filter
    const urlParams = new URLSearchParams(window.location.search);
    const labId = urlParams.get('lab');
    if (labId) {
      labFilter.value = labId;
      filterLecturers();
    } else {
      renderLecturers();
    }

    lecturersContainer.style.display = 'grid';
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Error loading lecturers');
  } finally {
    loading.style.display = 'none';
  }
}

function populateLabFilter() {
  labFilter.innerHTML = '<option value="all">All Labs</option>';
  allLabs.forEach(lab => {
    const option = document.createElement('option');
    option.value = lab.id;
    option.textContent = lab.name;
    labFilter.appendChild(option);
  });
}

function setupFilters() {
  searchInput.addEventListener('input', filterLecturers);
  labFilter.addEventListener('change', filterLecturers);
}

function filterLecturers() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedLab = labFilter.value;

  filteredLecturers = allLecturers.filter(lecturer => {
    const matchesSearch = lecturer.name.toLowerCase().includes(searchTerm) ||
                         lecturer.shortName.toLowerCase().includes(searchTerm) ||
                         lecturer.nip.includes(searchTerm);

    const matchesLab = selectedLab === 'all' || 
                      lecturer.labs.some(l => l.labId === parseInt(selectedLab));

    return matchesSearch && matchesLab;
  });

  renderLecturers();
}

function renderLecturers() {
  if (filteredLecturers.length === 0) {
    lecturersContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <h2>No lecturers found</h2>
        <p style="margin-top: 1rem;">Try adjusting your search or filter.</p>
      </div>
    `;
    return;
  }

  // Separate lecturers and staff based on functionalPosition
  const staffPositions = ['Laboran', 'Staf', 'Staf Admin', 'Teknisi', 'Staff', 'Laboratory Staff', 'Technician'];
  
  const lecturers = filteredLecturers.filter(person => {
    const position = person.functionalPosition || '';
    return !staffPositions.some(staffPos => position.toLowerCase().includes(staffPos.toLowerCase()));
  });
  
  const staff = filteredLecturers.filter(person => {
    const position = person.functionalPosition || '';
    return staffPositions.some(staffPos => position.toLowerCase().includes(staffPos.toLowerCase()));
  });

  let html = '';
  
  // Render Lecturers Section
  if (lecturers.length > 0) {
    html += `
      <div style="grid-column: 1/-1; margin-top: 2rem;">
        <h2 style="font-size: 2rem; color: var(--neon-cyan); text-align: center; margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 2px;">
          <span style="border-bottom: 3px solid var(--neon-cyan); padding-bottom: 0.5rem;">Dosen</span>
        </h2>
      </div>
      ${lecturers.map(lecturer => createLecturerCard(lecturer)).join('')}
    `;
  }
  
  // Render Staff Section
  if (staff.length > 0) {
    html += `
      <div style="grid-column: 1/-1; margin-top: 3rem;">
        <h2 style="font-size: 2rem; color: var(--neon-purple); text-align: center; margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 2px;">
          <span style="border-bottom: 3px solid var(--neon-purple); padding-bottom: 0.5rem;">Staf & Laboran</span>
        </h2>
      </div>
      ${staff.map(lecturer => createLecturerCard(lecturer)).join('')}
    `;
  }

  lecturersContainer.innerHTML = html;
}

function createLecturerCard(lecturer) {
  // Convert Google Drive link to direct image link
  let photoUrl = lecturer.photo;
  if (photoUrl && photoUrl.includes('drive.google.com')) {
    const fileIdMatch = photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      photoUrl = `https://lh3.googleusercontent.com/d/${fileId}=w500`;
    }
  }
  
  // Add retry mechanism with multiple fallback URLs
  const photoContent = photoUrl 
    ? `<img src="${photoUrl}" alt="${lecturer.name}" loading="lazy" 
        onerror="
          if(!this.retryCount) this.retryCount = 0;
          this.retryCount++;
          if(this.retryCount === 1) {
            this.src = this.src.replace('lh3.googleusercontent.com/d/', 'drive.google.com/thumbnail?id=').replace('=w500', '&sz=w500');
          } else if(this.retryCount === 2) {
            setTimeout(() => { this.src = '${photoUrl}'; this.retryCount = 1; }, 1000);
          } else {
            this.parentElement.innerHTML='${lecturer.shortName}';
          }
        ">`
    : lecturer.shortName;

  const position = lecturer.functionalPosition || 'Dosen';
  
  const labBadges = lecturer.labs.map(l => 
    `<span class="lab-badge">${l.lab.name}</span>`
  ).join('');

  return `
    <div class="lecturer-card" onclick="window.location.href='lecturer.html?shortName=${lecturer.shortName}'">
      <div class="lecturer-photo">
        ${photoContent}
      </div>
      <span class="lecturer-tag-display">${lecturer.shortName}</span>
      <h3 class="lecturer-name">${lecturer.name}</h3>
      <div class="lecturer-position">${position}</div>
      ${labBadges ? `<div class="lecturer-labs">${labBadges}</div>` : ''}
    </div>
  `;
}

function showError(message) {
  loading.style.display = 'none';
  lecturersContainer.style.display = 'block';
  lecturersContainer.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--neon-pink);">
      <h2>⚠️ ${message}</h2>
      <p style="margin-top: 1rem; color: var(--text-secondary);">
        Please try again later.
      </p>
    </div>
  `;
}
