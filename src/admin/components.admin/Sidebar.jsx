import React, { useContext } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
import { NavLink } from "react-router-dom";
import home_icon from "../assets.admin/assets_admin/home_icon.svg"
import appointmen_icon from "../assets.admin/assets_admin/appointment_icon.svg";
import add_icon from "../assets.admin/assets_admin/add_icon.svg";
import people_icon from "../assets.admin/assets_admin/people_icon.svg";

const Sidebar = () => {
  const { token } = useContext(UnifiedContext);

  // const token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhcmFAZ21haWwuY29tIiwiZXhwIjoxNzQzNzA0NDI1fQ.y0nAWsyg7II1rsMdBNz17UQ-N3HcL3hmYbM5v7I1x20";
  // localStorage.setItem("aToken", token);

  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/admin/dashboard"
        >
          <img src={home_icon} alt="" />
          <p>Панель управления</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/admin/all-appointments"
        >
          <img src={appointmen_icon} alt="" />
          <p>Записи</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/admin/add-doctor"
        >
          <img src={add_icon} alt="" />
          <p>Добавить доктора</p>
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md: min-w-72 cursor-pointer ${
              isActive ? "bg-[F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/admin/doctor-list"
        >
          <img src={people_icon} alt="" />
          <p>Список докторов</p>
        </NavLink>
      </ul>
    </div>
  );
};

export default Sidebar;
