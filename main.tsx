import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AttendanceKiosk from './App'
import AdminDashboard from './Admin'
import './index.css' // Pastikan file css tailwind ada

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Halaman utama untuk Karyawan Absen */}
        <Route path="/" element={<AttendanceKiosk />} />
        
        {/* Halaman rahasia untuk Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
