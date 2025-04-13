import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { NavLink } from "react-router-dom";
import home_icon from "../assets/assets_admin/home_icon.svg";
import appointmen_icon from "../assets/assets_admin/appointment_icon.svg";
import add_icon from "../assets/assets_admin/add_icon.svg";
import people_icon from "../assets/assets_admin/people_icon.svg";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhcmFAZ21haWwuY29tIiwiZXhwIjoxNzQzNzA0NDI1fQ.y0nAWsyg7II1rsMdBNz17UQ-N3HcL3hmYbM5v7I1x20";
  localStorage.setItem("aToken", token);

  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/Home/adminDashboard"
        >
          <img src={home_icon} alt="" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/Home/all-appointments"
        >
          <img src={appointmen_icon} alt="" />
          <p>Appointments</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/Home/add-doctor"
        >
          <img src={add_icon} alt="" />
          <p>Add Doctor</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/Home/doctor-list"
        >
          <img src={people_icon} alt="" />
          <p>Doctor List</p>
        </NavLink>
      </ul>
    </div>
  );
};

export default Sidebar;
