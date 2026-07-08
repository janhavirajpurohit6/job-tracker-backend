const token = localStorage.getItem('token');

// redirect to login if no token
if (!token) {
  window.location.href = '/index.html';
}

document.getElementById('userName').textContent = localStorage.getItem('userName') || '';

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = '/index.html';
});

let allApplications = [];

// fetch all applications
async function fetchApplications() {
  try {
    const res = await fetch('/api/applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch');
    allApplications = await res.json();
    renderApplications();
    renderStats();
  } catch (err) {
    console.error(err);
  }
}

// render stats
function renderStats() {
  const statuses = ['applied', 'oa', 'interview', 'offer', 'rejected'];
  const statsEl = document.getElementById('stats');
  statsEl.innerHTML = statuses.map(status => {
    const count = allApplications.filter(a => a.status === status).length;
    return `<div class="stat-box"><div class="count">${count}</div><div>${status}</div></div>`;
  }).join('');
}

// render table rows
function renderApplications() {
  const filter = document.getElementById('filterStatus').value;
  const filtered = filter === 'all' ? allApplications : allApplications.filter(a => a.status === filter);

  const tbody = document.getElementById('applicationsBody');
  tbody.innerHTML = filtered.map(app => `
    <tr>
      <td>${app.company_name}</td>
      <td>${app.role}</td>
      <td><span class="status-badge status-${app.status}">${app.status}</span></td>
      <td>${app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '-'}</td>
      <td>${app.notes || '-'}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editApplication(${app.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteApplication(${app.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// add application
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    company_name: document.getElementById('companyName').value,
    role: document.getElementById('role').value,
    status: document.getElementById('status').value,
    applied_date: document.getElementById('appliedDate').value || null,
    notes: document.getElementById('notes').value || null
  };

  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Failed to add');

    document.getElementById('addForm').reset();
    fetchApplications();
  } catch (err) {
    alert('Failed to add application');
  }
});

// filter dropdown change
document.getElementById('filterStatus').addEventListener('change', renderApplications);

// delete application
async function deleteApplication(id) {
  if (!confirm('Delete this application?')) return;

  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete');
    fetchApplications();
  } catch (err) {
    alert('Failed to delete application');
  }
}

// edit application (simple prompt-based edit for now)
async function editApplication(id) {
  const app = allApplications.find(a => a.id === id);
  const newStatus = prompt('Update status (applied/oa/interview/offer/rejected):', app.status);

  if (!newStatus) return;

  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        company_name: app.company_name,
        role: app.role,
        status: newStatus,
        applied_date: app.applied_date,
        notes: app.notes
      })
    });
    if (!res.ok) throw new Error('Failed to update');
    fetchApplications();
  } catch (err) {
    alert('Failed to update application');
  }
}

// initial load
fetchApplications();