// context/UnifiedContext.js
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { getUserByToken } from "../user/Auth";

export const UnifiedContext = createContext();

const UnifiedContextProvider = (props) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || "");
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const currency = "₸";
  const currencyAdmin = "$";
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "ru");

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);
  

  const backendUrl = "http://localhost:8000";


  // Получение профиля клиента
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const data = await getUserByToken(token);
          setUserData(data); // клиент
          setUser(data);     // клиент
        } catch {
          setUserData(null);
          setUser(null);
        }
      } else if (aToken) {
        // Временно проверяем, не админ ли — например, по локальному флагу или структуре токена
        const isAdmin = false; // замени на свою логику, если появится
        
        if (!isAdmin) {
          try {
            const data = await getUserByToken(aToken);
            setUserData(null); // доктор, без client info
            setUser(data);     // доктор
          } catch {
            setUser(null);
          }
        }
      } else {
        setUserData(null);
        setUser(null);
      }
    };
  
    fetchUser();
  }, [token, aToken]);
  
  
  
  





  // Загрузка списка врачей
  const getDoctorsData = () => {
    fetch(`${backendUrl}/doctors`)
  .then(async (res) => {
    const text = await res.text();
    if (!text) return []; // или null, если так логика приложения требует
    return JSON.parse(text);
  })
  .then(setDoctors)
  .catch((err) => console.error("Ошибка загрузки врачей:", err));
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return language === "ru" ? "Неверная дата" : "Invalid date";
  
    const [day, month, year] = slotDate.split("_");
  
    const monthNames = {
      ru: [
        "", "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
      ],
      en: [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    };
  
    const months = monthNames[language] || monthNames["ru"];
    return `${day} ${months[Number(month)]} ${year}`;
  };
  
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) {
      return "-";
    }
  
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
  
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };
  

  const value = {
    // Клиент
    token, setToken,
    userData, setUserData,
    user, setUser,
    doctors, getDoctorsData, setDoctors,
    currency,
    language, setLanguage,
    // Админ
    aToken, setAToken,
    currencyAdmin,
    slotDateFormat,
    calculateAge,
    // Общее
    backendUrl

  };

  return (
    <UnifiedContext.Provider value={value}>
      {props.children}
    </UnifiedContext.Provider>
  );
};

export default UnifiedContextProvider;
