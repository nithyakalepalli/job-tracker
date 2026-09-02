import { useState, useEffect } from 'react';
import './App.css';

const STATUS_OPTIONS = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];

function App() {
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchApplications = () => {
    const params = new URLSearchParams();
    if (filterCompany) params.append('company', filterCompany);
    if (filterStatus) params.append('status', filterStatus);

    fetch(`http://127.0.0.1:8000/applications?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => setApplications(data))
      .catch((error) => console.error('Error fetching applications:', error));
  };

  useEffect(() => {
    fetchApplications();
  }, [filterCompany, filterStatus]);

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('http://127.0.0.1:8000/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company,
        role,
        date_applied: dateApplied || null,
        job_url: jobUrl || null,
        notes: notes || null,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setCompany('');
        setRole('');
        setDateApplied('');
        setJobUrl('');
        setNotes('');
        fetchApplications();
      })
      .catch((error) => console.error('Error creating application:', error));
  };

  const handleStatusChange = (id, newStatus) => {
    fetch(`http://127.0.0.1:8000/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => response.json())
      .then(() => fetchApplications())
      .catch((error) => console.error('Error updating status:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8000/applications/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchApplications())
      .catch((error) => console.error('Error deleting application:', error));
  };

  const statusCounts = STATUS_OPTIONS.reduce((counts, status) => {
    counts[status] = applications.filter((app) => app.status === status).length;
    return counts;
  }, {});

  const totalApplications = applications.length;
  const responded = applications.filter((app) => app.status !== 'Applied').length;
  const responseRate = totalApplications > 0
    ? Math.round((responded / totalApplications) * 100)
    : 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Job Application Tracker</h1>
        <p>Keep track of where things stand, one application at a time.</p>
      </header>

      <div className="dashboard">
        <div className="dashboard-stat">
          <span className="value">{totalApplications}</span>
          <span className="label">Total applications</span>
        </div>
        <div className="dashboard-stat">
          <span className="value">{responseRate}%</span>
          <span className="label">Response rate</span>
        </div>
        <div className="dashboard-breakdown">
          {STATUS_OPTIONS.map((status) => (
            <span key={status}>{status}: {statusCounts[status]}</span>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Add an application</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="form-row">
            <input
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
            />
            <input
              type="text"
              placeholder="Job posting URL"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button type="submit">Add application</button>
        </form>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by company..."
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <ul className="applications-list">
        {applications.map((app) => (
          <li key={app.id} className="application-item">
            <div className="application-top">
              <div>
                <span className="application-title">{app.company}</span>{' '}
                <span className="application-role">— {app.role}</span>
              </div>
              <div className="application-controls">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="delete" onClick={() => handleDelete(app.id)}>
                  Delete
                </button>
              </div>
            </div>
            {(app.date_applied || app.job_url) && (
              <div className="application-meta">
                {app.date_applied && <span>Applied {app.date_applied}</span>}
                {app.job_url && (
                  <a href={app.job_url} target="_blank" rel="noreferrer">
                    View posting
                  </a>
                )}
              </div>
            )}
            {app.notes && <p className="application-notes">{app.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;