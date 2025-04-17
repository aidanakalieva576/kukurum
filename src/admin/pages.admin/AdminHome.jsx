import React from 'react';
import Navbar from '../components.admin/NavbarAdmin';

import Sidebar from '../components.admin/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Admin/Dashboard';  // Исправленный путь
import Appointments from './Admin/AllAppointments'; // Исправленный путь
import DoctorsList from './Admin/DoctorsList';  // Исправленный путь
import AddDoctor from './Admin/AddDoctor';
import { Outlet } from 'react-router-dom'

const AdminHome = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="all-appointments" element={<Appointments />} />
            <Route path="doctor-list" element={<DoctorsList />} />
            <Route path="add-doctor" element={<AddDoctor />} />
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
