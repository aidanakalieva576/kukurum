import React, { useContext, useEffect, useState } from "react";
import { UnifiedContext } from "../../../context/UnifiedContext";
import { assets } from "../../assets.admin/assets_admin/assetsadmin";

const Appointments = () => {
  const { calculateAge, slotDateFormat, currency } = useContext(UnifiedContext);
  const [activeAppointments, setActiveAppointments] = useState([]);
  const [historyAppointments, setHistoryAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:8000/admin/getting_appointments");
        const data = await res.json();

        if (res.ok) {
          setActiveAppointments(data.active_appointments);
          setHistoryAppointments(data.history_appointments);
        } else {
          console.error("Ошибка загрузки данных:", data.error);
        }
      } catch (error) {
        console.error("Ошибка запроса:", error);
      }
    };

    fetchAppointments();
  }, []);



  const renderRow = (item, index, isHistory = false) => (
    <div
      className={`flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center py-3 px-6 border-b ${isHistory ? "text-gray-400 bg-gray-50" : "text-gray-600 hover:bg-gray-50"
        }`}
      key={`${item.user_name}-${item.date}-${item.time}`}
    >
      <p className="max-sm:hidden">{index + 1}</p>

      {/* Пациент */}
      <div className="flex items-center gap-2">
        <img className="w-8 h-8 rounded-full" src={item.user_image} alt="" />
        <p>{item.user_name}</p>
      </div>

      {/* Возраст */}
      <p className="max-sm:hidden">{calculateAge(item.user_dob)}</p>

      {/* Дата и время */}
      <p>
        {slotDateFormat(item.date)}, {item.time}
      </p>

      {/* Доктор */}
      <div className="flex items-center gap-2">
        <img className="w-8 h-8 rounded-full bg-gray-200" src={item.doctor_image} alt="" />
        <p>{item.doctor_name}</p>
      </div>

      {/* Стоимость */}
      <p>
        {currency}
        {item.fees}
      </p>

      {/* Статус */}
      {item.cancelled ? (
        <p className="text-red-400 text-xs font-medium">Отменено</p>
      ) : item.isCompleted ? (
        <p className="text-green-500 text-xs font-medium">Завершено</p>
      ) : item.payment ? (
        <p className="text-green-500 text-xs font-medium">Оплачено</p>
      )
      :(
        <img
          className="w-8 h-8 ml-2 cursor-pointer"
          src={assets.cancel_icon}
          alt="cancel"
          onClick={() => handleCancelClick(item)}
        />
      )}
    </div>
  );








  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const res = await fetch(`http://localhost:8000/cancel_appointment/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setActiveAppointments((prev) =>
          prev.filter((appt) => appt.id !== selectedAppointment.id)
        );
        setHistoryAppointments((prev) => [
          { ...selectedAppointment, cancelled: true },
          ...prev,
        ]);
      } else {
        console.error("Ошибка при отмене записи");
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }

    setShowCancelModal(false);
    setSelectedAppointment(null);
  };




  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">Все записи</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {/* Заголовки */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b font-medium text-gray-700 bg-gray-100">
          <p>№</p>
          <p>Пациент</p>
          <p>Возраст</p>
          <p>Дата & Время</p>
          <p>Доктор</p>
          <p>Стоимость</p>
          <p>Операция</p>
        </div>

        {/* Активные */}
        {activeAppointments.map((item, index) => renderRow(item, index))}

        {/* История */}
        {historyAppointments.map((item, index) =>
          renderRow(item, index + activeAppointments.length, true)
        )}

        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm text-center shadow-lg">
              <p className="mb-4 text-lg font-medium">Вы уверены, что хотите отменить запись?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmCancelAppointment}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Да
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Appointments;
