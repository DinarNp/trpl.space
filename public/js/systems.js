// systems.js — Halaman Sistem Prodi
// Menampilkan projects dengan category "Sistem" (case-insensitive)

let allSystems = [];

async function loadSystems() {
  try {
    const res = await fetch('/api/projects');
    const json = await res.json();
    const projects = json.data || [];

    // Filter hanya kategori "Sistem" (case-insensitive)
    allSystems = projects.filter(p =>
      p.category && p.category.toLowerCase().trim() === 'sistem'
    );

    document.getElementById('loading').style.display = 'none';
    renderStats(allSystems);
    renderSystems(allSystems);

    document.getElementById('statsContainer').style.display = 'flex';
    document.getElementById('systemsContainer').style.display = 'grid';
  } catch (err) {
    document.getElementById('loading').innerHTML = `
      <p style="color: var(--neon-pink)">⚠️ Gagal memuat data sistem.</p>
    `;
  }
}

function renderStats(systems) {
  const total = systems.length;
  const active = systems.filter(s => s.status === 'active').length;
  const maintenance = systems.filter(s => s.status === 'maintenance').length;

  document.getElementById('statsContainer').innerHTML = `
    <div class="sstat">
      <span class="sstat-num">${total}</span>
      <span class="sstat-label">Total Sistem</span>
    </div>
    <div class="sstat">
      <span class="sstat-num">${active}</span>
      <span class="sstat-label">Aktif</span>
    </div>
    <div class="sstat">
      <span class="sstat-num">${maintenance}</span>
      <span class="sstat-label">Maintenance</span>
    </div>
  `;
}

function renderSystems(systems) {
  const container = document.getElementById('systemsContainer');

  if (systems.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">🖥️</div>
        <h3>Belum Ada Sistem</h3>
        <p>Belum ada sistem yang terdaftar. Tambahkan melalui Admin dengan kategori "Sistem".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = systems.map(s => {
    let tags = [];
    try { tags = JSON.parse(s.tags || '[]'); } catch {}

    const statusLabel = { active: 'Aktif', maintenance: 'Maintenance', archived: 'Arsip' }[s.status] || s.status;
    const statusClass = s.status || 'active';

    const lecturers = (s.lecturers || []).map(l =>
      `<span class="lecturer-chip">${l.shortName}</span>`
    ).join('');

    const tagBadges = tags.slice(0, 4).map(t =>
      `<span class="system-tag">${t}</span>`
    ).join('');

    const bannerStyle = s.color
      ? `background: ${s.color};`
      : 'background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(196,77,255,0.15));';

    const icon = s.icon || '🖥️';

    return `
      <div class="system-card" onclick="window.location.href='project.html?id=${s.id}'">
        <div class="system-banner" style="${bannerStyle}">
          <span class="system-banner-icon">${icon}</span>
        </div>
        <div class="system-body">
          <div class="system-header">
            <div class="system-name">${s.title}</div>
            <div class="system-status">
              <span class="status-dot ${statusClass}"></span>
              ${statusLabel}
            </div>
          </div>
          <p class="system-description">${s.description}</p>
          ${tagBadges ? `<div class="system-tags">${tagBadges}</div>` : ''}
          <div class="system-footer">
            <div class="system-lecturers">${lecturers}</div>
            ${s.url ? `<a class="btn-access" href="${s.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Akses</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterSystems() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;

  const filtered = allSystems.filter(s => {
    const matchSearch = !search ||
      s.title.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search);
    const matchStatus = status === 'all' || s.status === status;
    return matchSearch && matchStatus;
  });

  renderSystems(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterSystems);
document.getElementById('statusFilter').addEventListener('change', filterSystems);

// Show admin link if logged in
if (sessionStorage.getItem('adminLoggedIn')) {
  const link = document.getElementById('adminLink');
  if (link) link.style.display = 'block';
}

loadSystems();
