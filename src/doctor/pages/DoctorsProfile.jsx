import React, { useContext, useEffect, useState } from 'react';
import { UnifiedContext } from '../../context/UnifiedContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from "../../admin/assets.admin/assets_admin/assetsadmin";
import CalendarModal from '../../doctor/components/CalendarModal'; 
import translations from '../../utils';


const DoctorProfile = () => {
  const { currency } = useContext(UnifiedContext);
  const [doctor, setDoctor] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [slotMode, setSlotMode] = useState("manual");
  const { language } = useContext(UnifiedContext);
  const t = translations[language];

  // Новые состояния для модального окна "Добавить запись"
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchDoctorInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/doctor/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctor(res.data);
    } catch (error) {
      toast.error("Ошибка при загрузке данных врача: " + (error.response?.data?.detail || error.message));
    }
  };

  useEffect(() => {
    fetchDoctorInfo();
  }, []);

  const handleChange = (field, value) => {
    setDoctor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setDoctor(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:8000/doctor/update/me", doctor, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchDoctorInfo();
      setIsEdit(false);
    } catch (error) {
      toast.error("Ошибка при сохранении данных: " + (error.response?.data?.detail || error.message));
    }
  };

  // Функция обработки добавления записи
  const handleAddBooking = async () => {
    try {
      // Преобразуем дату из формата "YYYY-MM-DD" в "DD_MM_YYYY"
      const formattedDate = bookingDate.split('-').reverse().join('_');
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8000/doctor/book", {
        docId: doctor.id,
        slotDate: formattedDate,
        slotTime: bookingTime,
        email: bookingEmail || null 
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success("Запись успешно добавлена!");
      console.log("Booking successful:", response.data);
    } catch (err) {
      toast.error("Ошибка при бронировании записи: " + (err.response?.data?.detail || err.message));
    }
    setBookingModalOpen(false);
    setBookingEmail('');
    setBookingTime('');
    setBookingDate('');
  };


  if (!doctor) return <p className="m-5 text-gray-600">{t.loadpay}</p>;

  return (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          <img
            className='bg-primary/80 w-full sm:max-w-64 rounded-lg'
            src={doctor.image}
            alt={doctor.name}
          />
        </div>
        <div className='flex-1 border border-stone-100 rounded-lg p-8 pu-7 bg-white'>
          {/* Name */}
          {isEdit ? (
            <input
              className='text-2xl font-medium border px-2 py-1 rounded'
              value={doctor.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          ) : (
            <p className='text-3xl font-medium text-gray-700'>{doctor.name}</p>
          )}

          {/* Degree / Speciality / Experience */}
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            {isEdit ? (
              <>
                <input
                  className='border px-1 rounded'
                  value={doctor.degree}
                  onChange={e => handleChange('degree', e.target.value)}
                />
                <input
                  className='border px-1 rounded'
                  value={doctor.speciality}
                  onChange={e => handleChange('speciality', e.target.value)}
                />
                <input
                  className='border px-1 rounded w-20'
                  value={doctor.experience}
                  onChange={e => handleChange('experience', e.target.value)}
                />
              </>
            ) : (
              <>
                <p>{doctor.degree} - {doctor.speciality}</p>
                <button className='py-0.5 px-2 border text-xs rounded-full'>{doctor.experience}</button>
              </>
            )}
          </div>

          {/* About */}
          <div className='mt-3'>
            <p className='text-sm font-medium'>{t.about}:</p>
            {isEdit ? (
              <textarea
                className='w-full border rounded p-1 text-sm'
                value={doctor.about}
                onChange={e => handleChange('about', e.target.value)}
              />
            ) : (
              <p className='text-sm text-gray-600'>{doctor.about}</p>
            )}
          </div>

          {/* Fees */}
          <p className='text-gray-600 font-medium mt-4'>
            {t.AppFee}{' '}
            {isEdit ? (
              <input
                type="number"
                className='border px-1 w-24 rounded'
                value={doctor.fees}
                onChange={e => handleChange('fees', e.target.value)}
              />
            ) : (
              <span className='text-gray-800'>{currency} {doctor.fees}</span>
            )}
          </p>

          {/* Address */}
          <div className='flex flex-col gap-1 py-2'>
            <p>{t.address}</p>
            {isEdit ? (
              <>
                <input
                  className='border px-1 rounded'
                  value={doctor.address.line1}
                  onChange={e => handleAddressChange('line1', e.target.value)}
                />
                <input
                  className='border px-1 rounded'
                  value={doctor.address.line2}
                  onChange={e => handleAddressChange('line2', e.target.value)}
                />
              </>
            ) : (
              <p className='text-sm'>
                {doctor.address.line1}
                <br />
                {doctor.address.line2}
              </p>
            )}
          </div>

          {/* Availability */}
          <div className='flex items-center gap-1 pt-2'>
            <input
              type="checkbox"
              checked={doctor.available}
              onChange={e => handleChange('available', e.target.checked)}
              disabled={!isEdit}
            />
            <label>{t.available}</label>
          </div>
          <img
            src={assets.calendar}
            alt="calendar"
            onClick={() => setIsCalendarOpen(true)}
            className="cursor-pointer w-5 h-5 mt-4"
          />
        </div>

        {/* Buttons */}
        {isEdit ? (
          <div className='flex gap-2 mt-5'>
            <button
              onClick={handleSave}
              className='px-4 py-1 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all'
            >
              {t.save}
            </button>
            <button
              onClick={() => setIsEdit(false)}
              className='px-4 py-1 border border-gray-400 text-sm rounded-full'
            >
              {t.no}
            </button>
          </div>
        ) : (
          <div className='flex gap-2 mt-5'>
            <button
              onClick={() => setIsEdit(true)}
              className='px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
            >
              {t.edit}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className='px-4 py-1 border border-blue-400 text-sm text-blue-600 rounded-full hover:bg-blue-50 transition-all'
            >
              {t.Tune}
            </button>
            {doctor.settings && (
              <button
                onClick={() => setBookingModalOpen(true)} // Изменили на открытие модального окна
                className='px-4 py-1 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all'
              >
                {t.AddApp}
              </button>
            )}
          </div>
        )}
      </div>
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">{t.SettingSlots}</h2>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="slotMode"
                  value="manual"
                  checked={slotMode === "manual"}
                  onChange={() => setSlotMode("manual")}
                />
                {t.Manual}
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="slotMode"
                  value="auto"
                  checked={slotMode === "auto"}
                  onChange={() => setSlotMode("auto")}
                />
                {t.auto}
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-1 border rounded-full text-sm"
              >
                {t.no}
              </button>
              <button
                onClick={async () => {
                  try {
                    // Если слот установлен в авто-режим, то вызываем удаление
                    if (slotMode === "auto") {
                      const token = localStorage.getItem("token");
                      console.log("Deleting slots for doctor ID:", doctor.id);
                      await axios.delete(`http://localhost:8000/doctor/book?docId=${doctor.id}`, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      toast.success("Слоты успешно удалены.");
                    }

                    // Сохраняем настройки
                    const token = localStorage.getItem("token");
                    await axios.put(
                      "http://localhost:8000/doctor/update/me",
                      {
                        ...doctor,
                        settings: slotMode === "manual",
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    await fetchDoctorInfo();  
                    setIsSettingsOpen(false); 
                  } catch (err) {
                    toast.error("Ошибка при сохранении настроек: " + (err.response?.data?.detail || err.message));
                  }
                }}
                className="px-4 py-1 bg-primary text-white rounded-full text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isCalendarOpen && doctor && (
  <CalendarModal
    doctorId={doctor.id}
    onClose={() => setIsCalendarOpen(false)}
    onDateSelect={(selectedDate) => {
      console.log("Выбрана дата:", selectedDate.toISOString().split("T")[0]);
      setBookingDate(selectedDate.toISOString().split("T")[0]);
    }}
  />
)}
      
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">{t.AddApp}...</h2>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
              {t.emailCLient}
                <input
                  type="email"
                  value={bookingEmail}
                  onChange={e => setBookingEmail(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
              {t.Appotime}
                <input
                  type="time"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
              {t.Appodate}
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-1 border rounded-full text-sm"
              >
                {t.no}
              </button>
              <button
                onClick={handleAddBooking}
                className="px-4 py-1 bg-primary text-white rounded-full text-sm"
              >
                {t.add}
              </button>
            </div>
          </div>
          

        </div>
      )}
    </div>
  

  );
};

export default DoctorProfile;
