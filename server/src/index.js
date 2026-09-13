import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store for RPLApp sample features / items
let sampleProjects = [
  {
    id: 1,
    title: 'Sistem Informasi Presensi Kampus',
    category: 'Web Application',
    status: 'In Progress',
    description: 'Aplikasi pencatatan absensi mahasiswa menggunakan QR Code dan geolokasi.'
  },
  {
    id: 2,
    title: 'E-Commerce UMKM Lokal',
    category: 'Fullstack App',
    status: 'Completed',
    description: 'Platform jual beli online untuk mendukung pemasaran produk UMKM lokal.'
  },
  {
    id: 3,
    title: 'Manajemen Tugas Tim RPL',
    category: 'Project Management',
    status: 'Planned',
    description: 'Aplikasi Kanban board sederhana untuk kolaborasi tim rekayasa perangkat lunak.'
  }
];

// Routes
// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend RPLApp API berjalan normal',
    timestamp: new Date().toISOString()
  });
});

// 2. Get all projects
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: sampleProjects
  });
});

// 3. Add new project
app.post('/api/projects', (req, res) => {
  const { title, category, status, description } = req.body;

  if (!title || !category) {
    return res.status(400).json({
      success: false,
      message: 'Title dan category wajib diisi'
    });
  }

  const newProject = {
    id: Date.now(),
    title,
    category,
    status: status || 'Planned',
    description: description || ''
  };

  sampleProjects.push(newProject);

  res.status(201).json({
    success: true,
    message: 'Proyek berhasil ditambahkan',
    data: newProject
  });
});

// 4. Delete project
app.delete('/api/projects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = sampleProjects.length;
  sampleProjects = sampleProjects.filter(p => p.id !== id);

  if (sampleProjects.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: 'Proyek tidak ditemukan'
    });
  }

  res.json({
    success: true,
    message: `Proyek dengan ID ${id} berhasil dihapus`
  });
});

// Server listener
app.listen(PORT, () => {
  console.log(`🚀 RPLApp Backend Server running at http://localhost:${PORT}`);
});

