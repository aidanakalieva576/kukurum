// import { createContext, useState, useEffect } from "react";

// export const AdminContext = createContext();

// const AdminContextProvider = (props) => {
//   const [aToken, setAToken] = useState("");


//   useEffect(() => {
//     const savedToken = localStorage.getItem("aToken");
//     if (savedToken) {
//       setAToken(savedToken);
//     }
//   }, []);

//   const value = { aToken, setAToken };

//   return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
// };

// export default AdminContextProvider;
