import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { AdminContext } from "../../context/AdminContext";

const Login = () => {
  const { setDToken } = useContext(DoctorContext); 
  const { setAToken } = useContext(AdminContext);  
  const [state, setState] = useState("Admin");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
  
    if (state === "Admin") {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhcmFAZ21haWwuY29tIiwiZXhwIjoxNzQzNzA0NDI1fQ.y0nAWsyg7II1rsMdBNz17UQ-N3HcL3hmYbM5v7I1x20";
      localStorage.setItem("aToken", token);
      navigate("/Home/adminDashboard");
    } else {
      const docToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRvY3RvckBleGFtcGxlLmNvbSIsImV4cCI6MTc0MzcwNDQyNX0.PTWaDjPfMfqJcrHEDkxBEB7Zs28SmgnCzQYQzJG7HTA";
      localStorage.setItem("dToken", docToken);
      navigate("/doctor-dashboard");
    }
  };
  
  return (
    <form className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>
        <button
          className="bg-primary text-white w-full py-2 rounded-md text-base"
          onClick={handleLogin}
        >
          Login
        </button>
        {state == "Admin" ? (
          <p>
            Doctor Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{" "}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
