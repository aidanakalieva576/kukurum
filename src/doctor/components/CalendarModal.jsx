import { useState, useEffect } from "react";

const CalendarModal = ({ doctorId, onClose }) => {
    const [date, setDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showDayModal, setShowDayModal] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getMonthName = (date) => {
        const months = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

    const getCalendarDays = (month, year) => {
        const daysInMonth = getDaysInMonth(month, year);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        const weeks = [];
        let currentDay = 1;

        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < offset) {
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

    const changeMonth = (direction) => {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + direction);
        setDate(newDate);
    };

    const handleDayClick = (day) => {
        if (!day) return;

        const clickedDate = new Date(date.getFullYear(), date.getMonth(), day);
        clickedDate.setHours(0, 0, 0, 0);
        if (clickedDate >= today) {
            setSelectedDay(clickedDate);
            setShowDayModal(true);
        }
    };
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (showDayModal && selectedDay) {
            console.log("useEffect с doctorId:", doctorId, "selectedDay:", selectedDay, "showDayModal:", showDayModal);

            const fetchAppointments = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:8000/doctor/get_doctor_appointments?doctor_id=${doctorId}`
                    );
            
                    if (!response.ok) {
                        const text = await response.text();
                        console.error("Ошибка от сервера:", response.status, text);
                        throw new Error(`Ошибка ${response.status}`);
                    }
            
                    const data = await response.json();
            
                    const formatted = data.active_appointments.filter(appt => {
                        const [day, month, year] = appt.date.split("_").map(Number);
                        const apptDate = new Date(year, month - 1, day);
                    
                        return (
                            apptDate.getFullYear() === selectedDay.getFullYear() &&
                            apptDate.getMonth() === selectedDay.getMonth() &&
                            apptDate.getDate() === selectedDay.getDate()
                        );
                    });
            
                    setAppointments(formatted);
                } catch (err) {
                    console.error("Ошибка загрузки записей:", err);
                }
            
            };

            fetchAppointments();
        }
    }, [showDayModal, selectedDay, doctorId]);

    return (
        <>
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-2xl overflow-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-4 text-gray-700">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="text-lg font-bold p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                        >
                            {"<"}
                        </button>
                        <h2 className="text-2xl font-semibold text-center flex-1">
                            {getMonthName(date)}
                        </h2>
                        <button
                            onClick={() => changeMonth(1)}
                            className="text-lg font-bold p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                        >
                            {">"}
                        </button>
                    </div>

                    <table className="w-full table-auto border-collapse text-center text-lg">
                        <thead>
                            <tr className="bg-gray-100">
                                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
                                    <th key={index} className="border border-gray-300 p-3">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {getCalendarDays(date.getMonth(), date.getFullYear()).map((week, i) => (
                                <tr key={i}>
                                    {week.map((day, j) => {
                                        const thisDate = new Date(date.getFullYear(), date.getMonth(), day);
                                        const isDisabled = !day || thisDate < today;

                                        return (
                                            <td
                                                key={j}
                                                onClick={() => handleDayClick(day)}
                                                className={`border border-gray-300 p-6 h-24 align-top transition cursor-pointer 
                          ${isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}`}
                                            >
                                                {day || ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-center mt-6">
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 shadow transition"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>

            {showDayModal && selectedDay && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                        <h3 className="text-xl font-bold text-center mb-4">Записи на {selectedDay.toLocaleDateString("ru-RU")}</h3>
                        {appointments.length > 0 ? (
                            <ul className="text-sm text-gray-700 space-y-2 max-h-80 overflow-y-auto">
                                {appointments.map((appt) => (
                                    <li key={appt.id} className="border p-3 rounded-md shadow">
                                        <div className="font-medium">{appt.user_name}</div>
                                        <div className="text-xs text-gray-500">
                                            {appt.time} · {appt.fees}₽ · {appt.payment ? "Оплачено" : "Не оплачено"}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500">Нет записей на эту дату.</p>
                        )}

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
        </>
    );
};

export default CalendarModal;
