import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UnifiedContext } from '../../context/UnifiedContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const doctorIdNumber = Number(docId.replace('doc', ''));
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(UnifiedContext);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [days, setDays] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!docId || !doctors) return;
    const doc = doctors.find((d) => d.id === doctorIdNumber);
    if (doc) setDocInfo(doc);
  }, [docId, doctors, doctorIdNumber]);

  useEffect(() => {
    if (!docInfo) return;

    const today = new Date();
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        const now = new Date();

        let startHour = now.getHours();
        let startMinute = now.getMinutes() > 30 ? 0 : 30;

        if (startHour < 10) {
          startHour = 10;
          startMinute = 0;
        } else {
          if (startMinute === 0) {
            startMinute = 30;
          } else {
            startMinute = 0;
            startHour += 1;
          }
        }

        currentDate.setHours(startHour, startMinute, 0, 0);
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      const timeSlots = [];
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      slots.push(timeSlots);
    }

    setDocSlots(slots);
  }, [docInfo]);

  useEffect(() => {
    if (!docSlots.length || !docSlots[slotIndex]?.length) {
      setAvailableTimes([]);
      return;
    }

    const selectedDate = docSlots[slotIndex][0].datetime;
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const slotDate = `${day}_${month}_${year}`;

    const fetchAvailableSlots = async () => {
      try {
        const res = await axios.get(`${backendUrl}/users_api/available-slots/`, {
          params: {
            docId: doctorIdNumber,
            slotDate,
          },
        });
        setAvailableTimes(res.data.availableSlots);
      } catch (error) {
        console.error('Ошибка при загрузке доступных слотов:', error);
        setAvailableTimes([]);
      }
    };

    fetchAvailableSlots();
  }, [docSlots, slotIndex, backendUrl, doctorIdNumber]);

  useEffect(() => {
    if (!docInfo) return;

    const today = new Date();
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const formatted = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
      dates.push({
        date: d,
        displayDay: daysOfWeek[d.getDay()],
        displayDate: d.getDate(),
        queryDate: formatted,
      });
    }

    setDays(dates);
  }, [docInfo]);

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Войдите в аккаунт чтобы записаться к врачу");
      return navigate('/login');
    }

    if (!slotTime) {
      toast.warn("Пожалуйста, выберите время для записи.");
      return;
    }

    const dateObj = docSlots[slotIndex]?.[0]?.datetime;
    if (!dateObj) {
      toast.error("Невозможно определить дату записи.");
      return;
    }

    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = month < 10 ? `0${month}` : month;
    const slotDate = `${paddedDay}_${paddedMonth}_${year}`;

    try {
      const res = await axios.post(
        `${backendUrl}/users_api/book/`,
        { docId: doctorIdNumber, slotDate, slotTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = res.data;

      if (data?.message) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/user/my-appointments');
      } else {
        toast.error('Что-то пошло не так. Попробуйте снова.');
      }
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при попытке записи. Попробуйте позже.");
    }
  };

  return (
    docInfo && (
      <div>
        {/* Врач */}
        <div className="flex flex-col sm:flex-row gap-4">
          <img className="bg-primary w-full sm:w-60 rounded-lg" src={docInfo.image} alt="" />

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:ml-6">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="verified" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <span className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</span>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                Подробнее <img src={assets.info_icon} alt="info" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Цена: <span className="text-gray-600">{docInfo.fees}{currencySymbol}</span>
            </p>
          </div>
        </div>

        {/* Слоты */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          {docInfo.available ? (
            <>
              <p>Время для записи:</p>
              <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
                {days.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSlotIndex(index);
                      setSlotTime('');
                    }}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
                  >
                    <p>{item.displayDay}</p>
                    <p>{item.displayDate}</p>
                  </div>
                ))}
              </div>

              <div className="max-w-[1050px] overflow-x-auto mt-4">
                <div className="flex gap-3 whitespace-nowrap w-max px-1">
                  {availableTimes.map((time, index) => (
                    <p
                      key={index}
                      onClick={() => setSlotTime(time)}
                      className={`text-sm font-light px-5 py-2 rounded-full cursor-pointer flex-shrink-0 ${time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}
                    >
                      {time.toLowerCase()}
                    </p>
                  ))}
                </div>
              </div>

              {availableTimes.length > 0 && (
                <button
                  onClick={bookAppointment}
                  className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
                >
                  Записаться
                </button>
              )}

              {docInfo.settings && (
                <p className="text-xs text-orange-500 mt-2">
                  У этого врача включён ручной режим записи. Вы можете выбрать только предложенные свободные слоты.
                </p>
              )}

              {availableTimes.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">Все записи заняты</p>
              )}
            </>
          ) : (
            <p className="text-xl text-gray-500">Слоты на запись недоступны</p>
          )}
        </div>

        <RelatedDoctors docId={docId} speciality={docInfo?.speciality} />
      </div>
    )
  );
};

export default Appointment;
