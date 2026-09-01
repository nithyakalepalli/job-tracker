import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];

function App() {
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
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
      body: JSON.stringify({ company, role }),
    })
      .then((response) => response.json())
      .then(() => {
        setCompany('');
        setRole('');
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

  return (
    <div>
      <h1>Job Application Tracker</h1>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">Add Application</button>
      </form>

      <div>
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

      <ul>
        {applications.map((app) => (
          <li key={app.id}>
            {app.company} — {app.role}{' '}
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
            <button onClick={() => handleDelete(app.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;