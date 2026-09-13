import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [status, setStatus] = useState('Planned');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check server health and fetch projects
  useEffect(() => {
    checkHealth();
    fetchProjects();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data proyek:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, status, description })
      });
      const result = await res.json();
      if (result.success) {
        setProjects([...projects, result.data]);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error('Gagal menambah proyek:', err);
      alert('Gagal menghubungi backend API. Pastikan server berjalan!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus proyek ini?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Gagal menghapus proyek:', err);
    }
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'In Progress': return 'badge-status-in-progress';
      case 'Completed': return 'badge-status-completed';
      default: return 'badge-status-planned';
    }
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">💻</span>
          <div>
            <h1 className="brand-title">RPLApp</h1>
            <p className="brand-subtitle">Portal Manajemen Proyek Rekayasa Perangkat Lunak</p>
          </div>
        </div>

        <div className={`server-status ${serverOnline ? 'status-online' : 'status-offline'}`}>
          <span className="status-dot"></span>
          <span>{serverOnline ? 'Backend API Terhubung' : 'Backend API Disconnect'}</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Form Tambah Proyek */}
        <section className="card">
          <h2 className="card-title">➕ Tambah Proyek Baru</h2>
          <form onSubmit={handleAddProject}>
            <div className="form-group">
              <label className="form-label">Nama Proyek</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Sistem Kasir Toko"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Web Application">Web Application</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Fullstack App">Fullstack App</option>
                <option value="Project Management">Project Management</option>
                <option value="API Service">API Service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi Singkat</label>
              <textarea
                className="form-textarea"
                placeholder="Deskripsi fitur atau tujuan aplikasi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Proyek'}
            </button>
          </form>
        </section>

        {/* Daftar Proyek */}
        <section className="card">
          <div className="projects-header">
            <h2 className="card-title">📋 Daftar Proyek RPL</h2>
            <span className="project-count">{projects.length} Proyek Terdaftar</span>
          </div>

          {loading ? (
            <div className="empty-state">Memuat data proyek...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">Belum ada proyek yang ditambahkan.</div>
          ) : (
            <div className="project-list">
              {projects.map((item) => (
                <div key={item.id} className="project-card">
                  <div className="project-top">
                    <h3 className="project-name">{item.title}</h3>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(item.id)}
                      title="Hapus Proyek"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="badge-group">
                    <span className="badge badge-category">{item.category}</span>
                    <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.description && (
                    <p className="project-desc">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

