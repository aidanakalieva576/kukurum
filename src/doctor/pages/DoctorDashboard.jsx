import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../admin/assets.admin/assets_admin/assetsadmin";
import { UnifiedContext } from "../../context/UnifiedContext";
import axios from "axios";

const DashboardDoctor = () => {
    const { currency, slotDateFormat, backendUrl, userData } = useContext(UnifiedContext);
    const [appointments, setAppointments] = useState({ active_appointments: [], history_appointments: [] });
    console.log("DashboardDoctor рендерится. userData:", userData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8000/doctor/get_doctor_appointments`, {
                    params: { doctor_id: userData.id },
                });
                setAppointments(res.data);
            } catch (error) {
                console.error("Ошибка при получении записей врача:", error);
            } finally {
                setLoading(false);
            }
        };
    
        if (userData?.id) {
            fetchAppointments();
        }
    }, [userData]);
    
    if (loading) {
        return <div>Загрузка...</div>;
    }
    return (
        <div className="m-5">
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets.earning_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">
                            {currency}{" "}
                            {appointments.active_appointments.reduce((acc, appt) => acc + (appt.fees || 0), 0)}
                        </p>
                        <p className="text-gray-400">Earnings</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets.appointments_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">
                            {appointments.active_appointments.length}
                        </p>
                        <p className="text-gray-400">Appointments</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
                    <img className="w-14" src={assets.patients_icon} alt="" />
                    <div>
                        <p className="text-xl font-semibold text-gray-600">
                            {
                                new Set(
                                    appointments.active_appointments.map((item) => item.user_name)
                                ).size
                            }
                        </p>
                        <p className="text-gray-400">Patients</p>
                    </div>
                </div>
            </div>

            <div className="bg-white">
                <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
                    <img src={assets.list_icon} alt="" />
                    <p className="font-semibold">Latest Bookings</p>
                </div>

                <div className="pt-4 border border-t-0">
                    {appointments.active_appointments.map((item, index) => (
                        <div
                            className="flex justify-between items-center px-6 py-3 gap-3 hover:bg-gray-100"
                            key={item.id}
                        >
                            <div className="flex items-center gap-3">
                                <img className="rounded-full w-10" src={item.user_image} alt="patient" />
                                <div className="text-sm">
                                    <p className="text-gray-800 font-medium">{item.user_name}</p>
                                    <p className="text-gray-600">
                                        {slotDateFormat(item.date)} at {item.time}
                                    </p>
                                </div>
                            </div>
                            {item.cancelled ? (
                                <p className="text-red-500 text-sm">cancelled</p>
                            ) : item.isCompleted ? (
                                <p className="text-green-500 text-sm">completed</p>
                            ) : (
                                <p className="text-blue-500 text-sm">active</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardDoctor;
