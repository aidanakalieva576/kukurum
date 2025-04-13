import React, { useContext } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";
import AllAppointments from "../pages/Admin/AllAppointments";
import DoctorsList from "../pages/Admin/DoctorsList";
import AddDoctor from "../pages/Admin/AddDoctor";


const AdminHome = () => {
  return (
    <div>
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <div className="flex-1">
            <Routes>
              <Route path="adminDashboard" element={<Dashboard />} />
              <Route path="all-appointments" element={<AllAppointments />} />
              <Route path="doctor-list" element={<DoctorsList />} />
              <Route path="add-doctor" element={<AddDoctor />} />
            </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
 