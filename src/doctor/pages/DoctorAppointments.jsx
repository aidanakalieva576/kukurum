import React, { useContext, useState, useEffect } from "react";
import { docappointments } from "../../admin/assets.admin/assets_admin/mock";
import { UnifiedContext } from "../../context/UnifiedContext";
import { assets } from "../../admin/assets.admin/assets_admin/assetsadmin";
import { jwtDecode } from "jwt-decode";
import translations from "../../utils";


const DoctorAppointments = () => {
    const { calculateAge, slotDateFormat, currency } = useContext(UnifiedContext);
    const [appointments, setAppointments] = useState({ active: [], history: [] });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [startedAppointments, setStartedAppointments] = useState({});
    const [sessionData, setSessionData] = useState({
        startTime: null,
        endTime: null,
    });
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [runningTimers, setRunningTimers] = useState({});
    const { language } = useContext(UnifiedContext);
    const t = translations[language];

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const updatedTimers = {};
    
            Object.entries(startedAppointments).forEach(([id, { startTime }]) => {
                const diff = Math.floor((now - new Date(startTime)) / 1000);
                const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
                const seconds = String(diff % 60).padStart(2, '0');
                updatedTimers[id] = `${minutes}:${seconds}`;
            });
    
            setRunningTimers(updatedTimers);
        }, 1000);
    
        return () => clearInterval(interval);
    }, [startedAppointments]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const decoded = jwtDecode(token);
                const doctorId = decoded.id;

                if (!doctorId) return;

                const response = await fetch(`http://localhost:8000/doctor/get_doctor_appointments?doctor_id=${doctorId}`);
                const data = await response.json();

                setAppointments({
                    active: data.active_appointments || [],
                    history: data.history_appointments || []
                    
                })
                console.log("data:", data.active_appointments, data.history_appointments);
            } catch (error) {
                console.error("Ошибка при загрузке назначений:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    if (loading) {
        return <p className="p-5">{t.loadpay}</p>;
    }


    const cancelAppointment = async () => {
        try {
            await fetch(`http://localhost:8000/cancel_appointment/${selectedAppointmentId}`, {
                method: "PATCH",
            });

            setAppointments(prev => ({
                ...prev,
                active: prev.active.filter(item => item.id !== selectedAppointmentId),
                history: [...prev.history, {
                    ...prev.active.find(item => item.id === selectedAppointmentId),
                    cancelled: true,
                }],
            }));
        } catch (err) {
            console.error("Ошибка при отмене:", err);
        } finally {
            setShowModal(false);
            setSelectedAppointmentId(null);
        }
    };

    const handleStartOrPause = async (appointmentId) => {
        if (!startedAppointments[appointmentId]) {
          // Прием начат
          setStartedAppointments(prev => ({
            ...prev,
            [appointmentId]: {
              startTime: new Date(),
            }
          }));
        } else {
          const start = startedAppointments[appointmentId].startTime;
          const end = new Date();
          const duration = Math.round((end - new Date(start)) / 60000);
      
          // ✅ Завершаем приём на бэкенде
          try {
            await fetch(`http://localhost:8000/doctor/complete_appointment/${appointmentId}`, {
              method: "PATCH",
            });
          } catch (err) {
            console.error("Ошибка при завершении приёма:", err);
          }
      
          setSessionData({ startTime: start, endTime: end, duration });
          setShowSessionModal(true);
      
          setStartedAppointments(prev => {
            const copy = { ...prev };
            delete copy[appointmentId];
            return copy;
          });
      
          setAppointments(prev => ({
            ...prev,
            active: prev.active.filter(a => a.id !== appointmentId),
            history: [...prev.history, {
              ...prev.active.find(a => a.id === appointmentId),
              isCompleted: true,
            }]
          }));
        }
      };

    return (
        <div className="w-full max-w-6xl m-5">
  <p className="mb-3 text-lg font-medium">{t.AllAppointments}</p>

  <div className="bg-white border-rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
    <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
      <p>#</p>
      <p>{t.patient}</p>
      <p>{t.payment}</p>
      <p>{t.age}</p>
      <p>{t.timedate}</p>
      <p>{t.fee}</p>
      <p className="ml-2">{t.Action}</p>
    </div>

    {/* Active Appointments */}
    {appointments.active.length > 0 && (
      <>
        {appointments.active.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img className="w-8 rounded-full" src={item.user_image} alt="" />
              <p>{item.user_name}</p>
            </div>
            <span>
              {item.payment ? (
                <img className="w-4 h-4 ml-5" src={assets.check} alt="Payment Confirmed" />
              ) : (
                <span className="text-xs inline-flex items-center justify-center border border-primary px-2 py-0.5 rounded-full whitespace-nowrap h-6 w-[60px] text-center">
                  CASH
                </span>
              )}
            </span>
            <p className="max-sm:hidden ml-1">{calculateAge(item.user_dob)}</p>
            <p>
              {slotDateFormat(item.date)}, {item.time}
            </p>
            <p>
              {currency}
              {item.fees}
            </p>
            <div className="flex flex-col items-center mr-9">
              {startedAppointments[item.id] && (
                <span className="text-xs text-orange-300 font-mono mb-1 ml-10">
                  {runningTimers[item.id] || "00:00"}
                </span>
              )}
              <div className="flex">
                <img
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                  onClick={() => {
                    setSelectedAppointmentId(item.id);
                    setShowModal(true);
                  }}
                />
                <img
                  className="w-10 cursor-pointer"
                  src={
                    startedAppointments[item.id]
                      ? assets.pause_icon
                      : assets.tick_icon
                  }
                  alt=""
                  onClick={() => handleStartOrPause(item.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </>
    )}

    {/* History Appointments */}
    {appointments.history.length > 0 && (
      <>
        <p className="font-semibold text-sm mb-2 text-gray-400 mt-8">{t.history}</p>
        {appointments.history.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-400 py-3 px-6 border-b"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img className="w-8 rounded-full" src={item.user_image} alt="" />
              <p>{item.user_name}</p>
            </div>
            <span className="text-xs inline-flex items-center justify-center border border-primary px-2 py-0.5 rounded-full whitespace-nowrap h-6 w-[60px] text-center">
              CASH
            </span>
            <p className="max-sm:hidden ml-2">{calculateAge(item.user_dob)}</p>
            <p>
              {slotDateFormat(item.date)}, {item.time}
            </p>
            <p>
              {currency}
              {item.fees}
            </p>
            <div className="flex">
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">{t.cancel}</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">{t.complete}</p>
              ) : null}
            </div>
          </div>
        ))}
      </>
    )}
  </div>

  {/* Cancel Confirmation Modal */}
  {showModal && (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <p className="text-lg font-semibold mb-4">{t.Areyousure}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            {t.no}
          </button>
          <button
            onClick={cancelAppointment}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-darkprimary"
          >
            {t.yes}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Session Complete Modal */}
  {showSessionModal && (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <p className="text-xl font-semibold mb-4 text-green-600">{t.AppComplete}</p>
        <p className="mb-2">{t.AppStart} <b>{new Date(sessionData.startTime).toLocaleTimeString()}</b></p>
        <p className="mb-4">{t.Duration} <b>{sessionData.duration} {t.min}</b></p>
        <button
          onClick={() => setShowSessionModal(false)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
        >
          {t.ok}
        </button>
      </div>
    </div>
  )}
</div>
    )}

export default DoctorAppointments;
