import React, { useContext } from "react";
import { assets } from "../../user/assets/assets";
import { UnifiedContext } from "../../context/UnifiedContext";
import { useNavigate } from "react-router-dom";
import translations from "../../utils";

const Navbar = () => {
  const { token, setToken, language, setLanguage } = useContext(UnifiedContext);
  const t = translations[language];
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
      {/* Лого и роль */}
      <div className="flex items-center gap-2 text-xs">
        <img className="w-36 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
        <p className="border px-2.5 rounded-full border-gray-500 text-gray-600">
          {role === "admin" ? "Admin" : "Doctor"}
        </p>
      </div>

      {/* Правый блок: язык и выход */}
      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <div className="relative group">
          <img
            className="w-5 h-5 opacity-70 cursor-pointer"
            src={assets.ball}
            alt="language"
          />
          <div className="absolute right-0 pt-2 hidden group-hover:block z-20">
            <div className="bg-stone-100 rounded shadow-md px-3 py-2 flex flex-col gap-1 text-sm">
              <p
                onClick={() => setLanguage("ru")}
                className={`cursor-pointer hover:text-black ${
                  language === "ru" ? "font-semibold" : ""
                }`}
              >
                RU
              </p>
              <p
                onClick={() => setLanguage("en")}
                className={`cursor-pointer hover:text-black ${
                  language === "en" ? "font-semibold" : ""
                }`}
              >
                EN
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-primary text-white text-sm px-6 py-2 rounded-full"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
