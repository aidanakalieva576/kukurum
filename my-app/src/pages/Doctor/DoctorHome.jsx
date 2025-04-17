import React, { useEffect, useContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import DoctorDashboard from "./DashboardDoctor";
import DoctorAppointments from "./DoctorAppointments";
import DoctorProfile from "./DoctorProfile";
import DoctorSidebar from "../../components/DoctorSidebar";
import { DoctorContext } from "../../context/DoctorContext";
import Chat from "./Chat"

const DoctorHome = () => {
  const { setDToken } = useContext(DoctorContext);

  return (
    <div>
      <Navbar />
      <div className="flex items-start">
        <DoctorSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="chat" element={<Chat/>} />
            <Route path="" element={<DoctorDashboard />} /> 
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;