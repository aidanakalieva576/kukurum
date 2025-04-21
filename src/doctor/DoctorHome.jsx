import React from 'react';
import { useEffect, useContext } from "react";
import Navbar from '../admin/components.admin/NavbarAdmin';
import { Routes, Route } from "react-router-dom";
import DashboardDoctor from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorProfile from './pages/DoctorsProfile';
import DoctorSidebar from './components/DoctorSidebar';
import { UnifiedContext } from '../context/UnifiedContext';
import ChatList from './components/ChatList';
import DoctorChat from './pages/DoctorChat';

const DoctorPage = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-start">
        <DoctorSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="dashboard" element={<DashboardDoctor />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="/chat" element={<ChatList />} />
            <Route path="/chat/:id" element={<DoctorChat />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
