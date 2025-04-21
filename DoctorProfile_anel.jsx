import React, { useContext, useState } from "react";
import { assets, doctors } from "../../assets/assets_frontend/assets";
import { AppContext } from "../../context/AppContext";
import "react-calendar/dist/Calendar.css";

const DoctorProfile = () => {
  const doctor = doctors[0];
  const { currency } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date());

  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(null);

  const getMonthName = (date) => {
    const months = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCalendarDays = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const weeks = [];
    let currentDay = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push("");
        } else if (currentDay <= daysInMonth) {
          week.push(currentDay);
          currentDay++;
        } else {
          week.push("");
        }
      }
      weeks.push(week);
      if (currentDay > daysInMonth) break;
    }
    return weeks;
  };

  // Изменение месяца
  const changeMonth = (direction) => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + direction);
    setDate(newDate);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 m-5">
        <div>
          <img
            className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
            src={doctor.image}
            alt={doctor.name}
          />
        </div>
        <div className="flex-1 border border-stone-100 rounded-lg p-8 pu-7 bg-white">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {doctor.name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>
              {doctor.degree} - {doctor.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {doctor.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
              About:
            </p>
            <p className="text-sm text-gray-600 max-w-[700px] mt-1">
              {doctor.about}
            </p>
          </div>

          <p className="text-gray-600 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-800">
              {currency} {doctor.fees}
            </span>
          </p>
          <div className="flex gap-2 py-2">
            <p>Address</p>
            <p className="text-sm">
              {doctor.address.line1}
              <br />
              {doctor.address.line2}
            </p>
          </div>

          {/* КНОПКА-КАЛЕНДАРЬ */}
          <div>
            <img
              src={assets.calendar}
              alt="calendar"
              onClick={() => setShowModal(true)}
              className="cursor-pointer w-5 h-5 mt-4"
            />
          </div>

          <div className="flex gap-1 pt-2">
            <input type="checkbox" />
            <label htmlFor="">Available</label>
          </div>

          <button className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all">
            Edit
          </button>
        </div>
      </div>

      {/* модалка */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-6xl w-full shadow-xl overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-4 text-sm text-gray-700">
              <div className="text-left">
                <button onClick={() => changeMonth(-1)}>{"<"}</button>
              </div>
              <h2 className="text-3xl font-bold text-center flex-1">
                {getMonthName(date)}
              </h2>
              <div className="text-right">
                <button onClick={() => changeMonth(1)}>{">"}</button>
              </div>
            </div>

            {/* Таблица календаря */}
            <table className="w-full table-fixed border border-black text-center text-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2">Понедельник</th>
                  <th className="border border-black p-2">Вторник</th>
                  <th className="border border-black p-2">Среда</th>
                  <th className="border border-black p-2">Четверг</th>
                  <th className="border border-black p-2">Пятница</th>
                  <th className="border border-black p-2">Суббота</th>
                  <th className="border border-black p-2">Воскресенье</th>
                </tr>
              </thead>
              <tbody>
                {getCalendarDays(date.getMonth(), date.getFullYear()).map(
                  (week, i) => (
                    <tr key={i}>
                      {week.map((day, j) => (
                        <td
                          key={j}
                          className="border border-black p-6 h-24 align-top cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => {
                            if (day) {
                              const clickedDate = new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                day
                              );
                              setSelectedDay(clickedDate);
                              setShowDayModal(true);
                            }
                          }}
                        >
                          {day || ""}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="text-center mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка 2 */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-center mb-4">Записи</h3>
            <p className="text-gray-700 text-center">
              Записи: 
            </p>

            <div className="text-center mt-6">
              <button
                onClick={() => setShowDayModal(false)}
                className="px-5 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
