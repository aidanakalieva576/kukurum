import React, { useContext } from "react";
import { assets } from "../../user/assets/assets";
import { UnifiedContext } from "../../context/UnifiedContext";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const { token, setToken } = useContext(UnifiedContext);
  const navigate = useNavigate();

  const logout = () => {
    if (token) {
      setToken("");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };
  const role = localStorage.getItem("role");

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
          <p className="border px-2.5 rounded-full border-gray-500 text-gray-600">
            {role === "admin" ? "Admin" : "Doctor"}
          </p>
      </div>
      <button onClick={logout} className="bg-primary text-white text-sm px-10 py-2 rounded-full">Выйти</button>
    </div>
  );
};

export default Navbar;
