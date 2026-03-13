// Check authentication
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const loginTime = sessionStorage.getItem('loginTime');
  
  if (!isLoggedIn || !loginTime) {
    window.location.href = 'login.html';
    return false;
  }
  
  // Session expires after 24 hours
  const now = Date.now();
  const elapsed = now - parseInt(loginTime);
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  if (elapsed > twentyFourHours) {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

checkAuth();

const API_URL = 'http://localhost:3000/api';
let lecturers = [], labs = [], editingMemberId = null, deletingMemberId = null;

const elements = {
  loading: document.getElementById('loading'),
  tableContainer: document.getElementById('membersTableContainer'),
  tableBody: document.getElementById('lecturersTableBody'),
  addBtn: document.getElementById('addMemberBtn'),
  modal: document.getElementById('memberModal'),
  deleteModal: document.getElementById('deleteModal'),
  form: document.getElementById('memberForm'),
  modalTitle: document.getElementById('modalTitle'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  toast: document.getElementById('toast'),
  shortNameInput: document.getElementById('shortName'),
  shortNamePreview: document.getElementById('shortNamePreview'),
  addEducationBtn: document.getElementById('addEducationBtn'),
  educationList: document.getElementById('educationList'),
  labCheckboxes: document.getElementById('labCheckboxes')
};

document.addEventListener('DOMContentLoaded', init);
elements.addBtn.addEventListener('click', openAddModal);
elements.closeModalBtn.addEventListener('click', closeModal);
elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
elements.confirmDeleteBtn.addEventListener('click', handleDelete);
elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
elements.form.addEventListener('submit', handleSubmit);
elements.logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('adminLoggedIn'); sessionStorage.removeItem('loginTime'); window.location.href = 'login.html'; });
elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });
elements.deleteModal.addEventListener('click', (e) => { if (e.target === elements.deleteModal) closeDeleteModal(); });
elements.shortNameInput.addEventListener('input', (e) => {
  const val = e.target.value.toUpperCase();
  e.target.value = val;
  elements.shortNamePreview.textContent = val || 'XXX';
});
elements.addEducationBtn.addEventListener('click', addEducationItem);

async function init() {
  await loadLabs();
  await loadMembers();
}

async function loadLabs() {
  try {
    const response = await fetch(`${API_URL}/labs`);
    const data = await response.json();
    if (data.success) {
      labs = data.data;
      renderLabCheckboxes();
    }
  } catch (error) {
    console.error('Error loading labs:', error);
  }
}

async function loadMembers() {
  try {
    elements.loading.style.display = 'block';
    elements.tableContainer.style.display = 'none';
    const response = await fetch(`${API_URL}/lecturers`);
    const data = await response.json();
    if (data.success) {
      lecturers = data.data;
      renderMembers();
      elements.tableContainer.style.display = 'block';
    } else {
      showToast('Failed to load members', 'error');
    }
  } catch (error) {
    console.error('Error loading lecturers:', error);
    showToast('Error loading lecturers', 'error');
  } finally {
    elements.loading.style.display = 'none';
  }
}

function renderMembers() {
  if (lecturers.length === 0) {
    elements.tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-secondary);">No members found.</td></tr>';
    return;
  }
  elements.tableBody.innerHTML = lecturers.map(lec => {
    // Convert Google Drive link to direct image link
    let photoUrl = lec.photo;
    if (photoUrl && photoUrl.includes('drive.google.com')) {
      const fileIdMatch = photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        photoUrl = `https://lh3.googleusercontent.com/d/${fileId}=w200`;
      }
    }
    
    return `
      <tr>
        <td>${photoUrl ? `<img src="${photoUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:center 10%;" onerror="this.outerHTML='👤'">` : '👤'}</td>
        <td>${lec.nip}</td>
        <td><strong>${lec.name}</strong></td>
        <td><span class="short-name-preview">${lec.shortName}</span></td>
        <td>${lec.email}</td>
        <td>${lec.labs?.length || 0}</td>
        <td>${lec.projects?.length || 0}</td>
        <td class="table-actions">
          <button class="btn-edit" onclick="openEditModal(${lec.id})">Edit</button>
          <button class="btn-delete-table" onclick="openDeleteModal(${lec.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderLabCheckboxes() {
  elements.labCheckboxes.innerHTML = labs.map(lab => `
    <div class="checkbox-item">
      <input type="checkbox" id="lab_${lab.id}" value="${lab.id}">
      <label for="lab_${lab.id}">${lab.name}</label>
    </div>
  `).join('');
}

function addEducationItem(degree = '', institution = '', major = '', thesisTitle = '', startYear = '', endYear = '') {
  const item = document.createElement('div');
  item.className = 'education-item';
  item.innerHTML = `
    <div class="education-fields">
      <select class="form-select education-degree" required>
        <option value="">Degree</option>
        <option value="D3" ${degree === 'D3' ? 'selected' : ''}>D3</option>
        <option value="S1" ${degree === 'S1' ? 'selected' : ''}>S1</option>
        <option value="Profesi" ${degree === 'Profesi' ? 'selected' : ''}>Profesi</option>
        <option value="S2" ${degree === 'S2' ? 'selected' : ''}>S2</option>
        <option value="S3" ${degree === 'S3' ? 'selected' : ''}>S3</option>
      </select>
      <input type="text" class="form-input education-institution" placeholder="Institution" value="${institution}" required>
      <input type="text" class="form-input education-major" placeholder="Major/Jurusan" value="${major}" required>
    </div>
    <div class="education-fields-year">
      <input type="number" class="form-input education-start-year" placeholder="Start" value="${startYear}" min="1900" max="2100" required>
      <input type="number" class="form-input education-end-year" placeholder="End" value="${endYear}" min="1900" max="2100" required>
      <input type="text" class="form-input education-thesis" placeholder="Judul TA/Tesis/Disertasi (optional)" value="${thesisTitle}">
    </div>
    <button type="button" class="btn-remove-edu" onclick="this.parentElement.remove()">×</button>
  `;
  elements.educationList.appendChild(item);
}

function openAddModal() {
  editingMemberId = null;
  elements.modalTitle.textContent = 'Add Member';
  elements.form.reset();
  elements.educationList.innerHTML = '';
  elements.shortNamePreview.textContent = 'XXX';
  addEducationItem();
  elements.modal.classList.add('active');
}

function openEditModal(id) {
  const lec = lecturers.find(l => l.id === id);
  if (!lec) return;
  editingMemberId = id;
  elements.modalTitle.textContent = 'Edit Member';
  
  document.getElementById('lecturerId').value = lec.id;
  document.getElementById('nip').value = lec.nip;
  document.getElementById('name').value = lec.name;
  document.getElementById('shortName').value = lec.shortName;
  document.getElementById('email').value = lec.email;
  document.getElementById('photo').value = lec.photo || '';
  document.getElementById('functionalPosition').value = lec.functionalPosition || '';
  document.getElementById('structuralPosition').value = lec.structuralPosition || '';
  document.getElementById('researchInterest').value = lec.researchInterest || '';
  document.getElementById('googleScholar').value = lec.googleScholar || '';
  document.getElementById('scopus').value = lec.scopus || '';
  document.getElementById('sinta').value = lec.sinta || '';
  document.getElementById('academicStaffUGM').value = lec.academicStaffUGM || '';
  document.getElementById('pddikti').value = lec.pddikti || '';
  elements.shortNamePreview.textContent = lec.shortName;
  
  elements.educationList.innerHTML = '';
  if (lec.educations && lec.educations.length > 0) {
    lec.educations.forEach(edu => addEducationItem(edu.degree, edu.institution, edu.major, edu.thesisTitle || '', edu.startYear, edu.endYear));
  } else {
    addEducationItem();
  }
  
  labs.forEach(lab => {
    const checkbox = document.getElementById(`lab_${lab.id}`);
    if (checkbox) {
      checkbox.checked = lec.labs?.some(l => l.labId === lab.id) || false;
    }
  });
  
  elements.modal.classList.add('active');
}

function closeModal() {
  elements.modal.classList.remove('active');
  elements.form.reset();
  editingMemberId = null;
}

function openDeleteModal(id) {
  deletingMemberId = id;
  elements.deleteModal.classList.add('active');
}

function closeDeleteModal() {
  elements.deleteModal.classList.remove('active');
  deletingMemberId = null;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const educationItems = Array.from(elements.educationList.querySelectorAll('.education-item')).map(item => {
    const degree = item.querySelector('.education-degree')?.value;
    const institution = item.querySelector('.education-institution')?.value;
    const major = item.querySelector('.education-major')?.value;
    const thesisTitle = item.querySelector('.education-thesis')?.value || null;
    const startYear = parseInt(item.querySelector('.education-start-year')?.value);
    const endYear = parseInt(item.querySelector('.education-end-year')?.value);
    
    // Validate
    if (!degree || !institution || !major || !startYear || !endYear) {
      console.error('Invalid education item:', { degree, institution, major, startYear, endYear });
      return null;
    }
    
    return {
      degree,
      institution,
      major,
      thesisTitle,
      startYear,
      endYear
    };
  }).filter(item => item !== null);
  
  const selectedLabs = Array.from(elements.labCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
  
  const formData = {
    nip: document.getElementById('nip').value.trim(),
    name: document.getElementById('name').value.trim(),
    shortName: document.getElementById('shortName').value.trim(),
    email: document.getElementById('email').value.trim(),
    photo: document.getElementById('photo').value.trim() || null,
    functionalPosition: document.getElementById('functionalPosition').value.trim() || null,
    structuralPosition: document.getElementById('structuralPosition').value.trim() || null,
    researchInterest: document.getElementById('researchInterest').value.trim() || null,
    googleScholar: document.getElementById('googleScholar').value.trim() || null,
    scopus: document.getElementById('scopus').value.trim() || null,
    sinta: document.getElementById('sinta').value.trim() || null,
    academicStaffUGM: document.getElementById('academicStaffUGM').value.trim() || null,
    pddikti: document.getElementById('pddikti').value.trim() || null,
    educations: educationItems,
    labIds: selectedLabs
  };
  
  try {
    const url = editingMemberId ? `${API_URL}/lecturers/${editingMemberId}` : `${API_URL}/lecturers`;
    const method = editingMemberId ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data.success) {
      showToast(data.message || 'Member saved successfully!', 'success');
      closeModal();
      await loadMembers(); // Wait for reload
    } else {
      console.error('Save failed:', data);
      if (data.errors) {
        // Zod validation errors
        const errorMessages = data.errors.map(e => `${e.path?.join('.')}: ${e.message}`).join(', ');
        showToast(`Validation error: ${errorMessages}`, 'error');
      } else {
        showToast(data.message || 'Failed to save lecturer', 'error');
      }
    }
  } catch (error) {
    console.error('Error saving lecturer:', error);
    showToast('Error saving lecturer: ' + error.message, 'error');
  }
}

async function handleDelete() {
  if (!deletingMemberId) return;
  try {
    const response = await fetch(`${API_URL}/lecturers/${deletingMemberId}`, { method: 'DELETE' });
    const data = await response.json();
    if (data.success) {
      showToast(data.message, 'success');
      closeDeleteModal();
      loadMembers();
    } else {
      showToast(data.message || 'Failed to delete lecturer', 'error');
    }
  } catch (error) {
    console.error('Error deleting lecturer:', error);
    showToast('Error deleting lecturer', 'error');
  }
}

function showToast(message, type = 'success') {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type}`;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
