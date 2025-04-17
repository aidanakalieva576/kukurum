
import axios from 'axios';




export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    const token = localStorage.getItem('token');
    console.log("Token из localStorage:", token);
    return token;
};


export async function getUserByToken(token) {
  try {
    const role = localStorage.getItem("role");
    console.log("Отправляю токен:", token, "Роль:", role);

    let url = "";

    if (role === "user") {
      url = `http://127.0.0.1:8000/users_api/me`;
    } else if (role === "doctor") {
      url = `http://127.0.0.1:8000/doctor/me`;
    } else if (role === "admin") {
    } else {
      console.error("Неизвестная роль:", role);
      return null;
    }

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      return res.data;
    }
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    return null;
  }
}
