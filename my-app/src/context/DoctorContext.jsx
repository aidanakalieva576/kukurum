import React, { createContext, useState, useEffect } from "react";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const [dToken, setDToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("dToken");
    if (token) {
      setDToken(token);
    }
  }, []);
  
  const value = { dToken, setDToken };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
