// import { createContext, useState, useEffect } from "react";
// import { getUserByToken, getToken } from "../user/Auth";
// import axios from "axios";

// export const AppContext = createContext();

// const AppContextProvider = (props) => {
//   const [doctors, setDoctors] = useState([]);
//   const currencySymbol = "₸";
//   const [token, setToken] = useState(localStorage.getItem("token") || "");
//   const [userData, setUserData] = useState(null);
//   const [user, setUser] = useState(null);

//   const backendUrl = "http://localhost:8000";
//   const doctorsUrl = `${backendUrl}/doctors`;

//   // Загружаем список врачей
//   const getDoctorsData = () => {
//     fetch(doctorsUrl)
//       .then((response) => response.json())
//       .then((data) => {
//         setDoctors(data);
//       })
//       .catch((error) => console.error("Ошибка загрузки данных:", error));
//   };

//   useEffect(() => {
//     getDoctorsData();
//   }, []);

//   // Загрузка userData через вспомогательную функцию
//   useEffect(() => {
//     if (!token) {
//       setUserData(null);
//       return;
//     }
//     getUserByToken(token)
//       .then((user) => {
//         setUserData(user);
//       })
//       .catch((err) => {
//         console.error("Не удалось загрузить профиль:", err);
//         setUserData(null);
//       });
//   }, [token]);

//   // Загружаем расширенные данные пользователя
//   const getUserInfo = async () => {
//     if (!token) return;

//     try {
//       const res = await axios.get(`${backendUrl}/users_api/me`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setUser(res.data);
//     } catch (error) {
//       console.log("Ошибка при получении профиля:", error);
//       setUser(null);
//     }
//   };

//   useEffect(() => {
//     getUserInfo();
//   }, [token]);

//   return (
//     <AppContext.Provider
//       value={{
//         doctors,
//         currencySymbol,
//         token,
//         setToken,
//         backendUrl,
//         userData,
//         setUserData,
//         getDoctorsData,
//         getUserInfo,
//         user,           // ✅ Добавлено сюда
//         setUser         // ✅ Добавлено сюда
//       }}
//     >
//       {props.children}
//     </AppContext.Provider>
//   );
// };

// export default AppContextProvider;
