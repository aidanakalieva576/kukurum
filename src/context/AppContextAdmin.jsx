// import { createContext, useState, useEffect } from "react";

// export const AppContext = createContext();

// const AppContextProviderAdmin = (props) => {

//   const currency = '$';

//   const [aToken, setAToken] = useState("");

//   const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//   const slotDateFormat = (slotDate) => {
//     const [year, month, day] = slotDate.split('-'); // <-- фикс
//     return `${day} ${months[Number(month)]} ${year}`;
//   };
  
//   useEffect(() => {
//     const savedToken = localStorage.getItem("aToken");
//     if (savedToken) {
//       setAToken(savedToken);
//     }
//   }, []);

//   const calculateAge = (dob) => {
//     const today = new Date();
//     const birthDate = new Date(dob);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     return age;
//   };

//   const value = {
//     aToken,
//     setAToken,
//     calculateAge,
//     slotDateFormat,
//     currency
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {props.children}
//     </AppContext.Provider>
//   );
// };

// export default AppContextProviderAdmin;
