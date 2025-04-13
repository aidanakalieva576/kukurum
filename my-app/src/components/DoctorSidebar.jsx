import React, { useContext } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { NavLink } from "react-router-dom";
import home_icon from "../assets/assets_admin/home_icon.svg";
import appointmen_icon from "../assets/assets_admin/appointment_icon.svg";
import people_icon from "../assets/assets_admin/people_icon.svg";

const DoctorSidebar = () => {
  const { dToken, setDToken } = useContext(DoctorContext);

  React.useEffect(() => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuQGdtYWlsLmNvbSIsImV4cCI6MTc0NDIxOTUxMX0.mGBzNfjdZytJ9yAq8hm4wylZ057haML3zrsxICpxVcI";
    localStorage.setItem("dToken", token);
    setDToken(token);
  }, []);

  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">
        <NavLink
          to="/doctor/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
        >
        <img src={home_icon} alt="Dashboard" className="w-5 h-5" />
        <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/doctor/appointments"
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
        >
        <img src={appointmen_icon} alt="" />
        <span>Appointments</span>
        </NavLink>
        <NavLink
          to="/doctor/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
        >
        <img src={people_icon} alt="" />
        <span>Doctor Profile</span>
        </NavLink>
        <NavLink
          to="/doctor/chat"
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
        >
        <img src={home_icon} alt="Chat" className="w-5 h-5" />
        <span>Chat</span>
        </NavLink>
      </ul>
    </div>
  );
};

export default DoctorSidebar;
