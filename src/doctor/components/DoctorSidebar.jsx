import React, { useContext } from "react";
import { UnifiedContext } from "../../context/UnifiedContext";
 import { NavLink } from "react-router-dom";
 import home_icon from "C:/Users/Admin/Desktop/курсовая/course/src/admin/assets.admin/assets_admin/home_icon.svg"
import appointmen_icon from "C:/Users/Admin/Desktop/курсовая/course/src/admin/assets.admin/assets_admin/appointment_icon.svg"
 import people_icon from "C:/Users/Admin/Desktop/курсовая/course/src/admin/assets.admin/assets_admin/people_icon.svg";
 
 const DoctorSidebar = () => {
   const { token, setToken } = useContext(UnifiedContext);
 
   React.useEffect(() => {
     localStorage.setItem("token", token);
     setToken(token);
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