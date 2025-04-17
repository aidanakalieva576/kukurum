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

  // Найти врача по ID
  useEffect(() => {
    if (!docId || !doctors) return;
    const doctorIdNumber = Number(docId.replace('doc', ''));
    const doc = doctors.find((d) => d.id === doctorIdNumber);
    if (doc) setDocInfo(doc);
  }, [docId, doctors]);

  // Сгенерировать слоты по времени (на 7 дней вперёд)
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
        console.log(now)

        // Начнем не раньше 10:00
        let startHour = now.getHours();
        let startMinute = now.getMinutes() > 30 ? 0 : 30;

        // если сейчас раньше 10:00 — начнем с 10:00
        if (startHour < 10) {
          startHour = 10;
          startMinute = 0;
        } else {
          // если уже после — начнем со следующего ближайшего слота
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

  // Устанавливаем доступные слоты по выбранному дню
  useEffect(() => {
    if (
      !docSlots.length ||
      !docSlots[slotIndex] ||
      docSlots[slotIndex].length === 0
    ) {
      setAvailableTimes([]);
      return;
    }

    const selectedDate = docSlots[slotIndex][0].datetime;
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const slotDate = `${day}_${month}_${year}`;
    console.log(slotDate)

    const fetchAvailableSlots = async () => {

      try {
        const res = await axios.get(`${backendUrl}/users_api/available-slots/`, {
          params: {
            docId: doctorIdNumber,
            slotDate,
          },
        });
        console.log('Слоты с сервера:', res.data.availableSlots);
        setAvailableTimes(res.data.availableSlots);
      } catch (error) {
        console.error('Ошибка при загрузке доступных слотов:', error);
        setAvailableTimes([]);
      }
    };


    fetchAvailableSlots();

  }, [docSlots, slotIndex]);


  // Устанавливаем список дней
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

    if (!docSlots[slotIndex] || !docSlots[slotIndex][0]) {
      toast.error("Невозможно определить дату записи. Пожалуйста, выберите слот.");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      const docID = doctorIdNumber

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const slotDate = `${day}_${month}_${year}`;
      console.log('ASASASAASSASASSSSS', slotDate)

      const res = await axios.post(
        `${backendUrl}/users_api/book/`,
        { docId: docID, slotDate, slotTime }, // Тело запроса
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = res.data;

      if (data && data.message) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/user/my-appointments');
      } else {
        toast.error('Что-то пошло не так. Попробуйте снова.');
      }

    } catch (error) {
      console.log(error);
      toast.error("Войдите чтобы сделать запись");
    }
  };



  return (
    docInfo && (
      <div>
        {/* Врач */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img className="bg-primary w-full sm:w-60 rounded-lg" src={docInfo.image} alt="" />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:ml-6">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                Подробнее <img src={assets.info_icon} alt="" />
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
                    onClick={() => setSlotIndex(index)}
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
                      className={`text-sm font-light px-5 py-2 rounded-full cursor-pointer flex-shrink-0 ${time === slotTime
                          ? 'bg-primary text-white'
                          : 'text-gray-400 border border-gray-300'
                        }`}
                    >
                      {time.toLowerCase()}
                    </p>
                  ))}
                </div>
              </div>
              <button
                onClick={bookAppointment}
                className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
              >
                Записаться
              </button>

              {availableTimes.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">Все записи заняты</p>
              )}
            </>
          ) : (
            <p className="text-xl text-gray-500 ">Слоты на запись недоступны</p>
          )}


        </div>

        <RelatedDoctors docId={docId} speciality={docInfo?.speciality} />
      </div>
    )
  );
};

export default Appointment;
