import React, { useContext, useEffect, useState } from 'react';
import { UnifiedContext } from '../../context/UnifiedContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';


const MyAppointments = () => {
  const { token, backendUrl, user } = useContext(UnifiedContext);
  const [appointments, setAppointments] = useState([]);
  const stripePromise = loadStripe('pk_test_51RCCFKCrNkMgRyYRIYGhZdryS3RVKWoO5EmQnRz0tUD3gz0FPns69u9vTpnrAH1toUFfwyfpB4sbHSYRsxDFL2eA009SNW8p4o');


  const fetchAppointments = async () => {
    if (!user || !user.id || !token) return;

    try {
      const res = await axios.get(`${backendUrl}/users_api/my-appointments/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при загрузке записей');
    }
  };

  const navigate = useNavigate()

  useEffect(() => {
    console.log("user", user);
    console.log("token", token);
  
    if (user?.id && token) {
      fetchAppointments();
      console.log("kdsmmklvmdkld");
    }
  }, [user, token]);

  const cancelAppointment = async (appointmentId) => {
    try {
      console.log("Отменяем запись:", appointmentId);  // debug

      const { data } = await axios.post(
        `${backendUrl}/users_api/cancel-appointment`,
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Ответ от бэка:", data);  // debug

      if (data?.message) {
        toast.success('Запись успешна отменена');
        fetchAppointments();
      } else {
        toast.error('Ошибка при отмене');
      }
    } catch (error) {
      console.error("Ошибка запроса:", error.response?.data || error.message);
      toast.error('Ошибка при отмене записи');
    }
  };

  const blizhaishie = appointments.filter((a) => {
    return !a.cancelled && !a.isCompleted;
  });
  
  const istoria = appointments.filter((a) => {
    return a.cancelled || a.isCompleted;
  });
  
  console.log("Appointments:", appointments);


  const [clientSecret, setClientSecret] = useState(null);

  // const handlePayClick = async () => {
  //   const res = await fetch(`${backendUrl}/users_api/create-payment`, { method: "POST" });
  //   const data = await res.json();
  //   setClientSecret(data.clientSecret);
  //   console.log("Ответ от сервера", data)
  // };

  // const handlePay = async (appointmentId) => {
  //   try {
  //     const { data } = await axios.post(
  //       `${backendUrl}/users_api/create-payment`,
  //       { appointmentId: appointmentId }
  //     );

  //     toast.success(data.message);

  //     // Обновляем appointments
  //     setAppointments((prev) =>
  //       prev.map((item) =>
  //         item.appointmentId === appointmentId
  //           ? { ...item, payment: true }
  //           : item
  //       )
  //     );
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('Ошибка при оплате');
  //   }
  // };

  const handlePay = async (appointmentId) => {
    console.log("Клик по оплате, appointmentId:", appointmentId);
    try {
      localStorage.setItem("appointmentId", appointmentId); // сохраняем id
      const { data } = await axios.post(
        `${backendUrl}/users_api/create-payment`,
        { appointmentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Ответ от /create-payment:", data);
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        console.log("clientSecret установлен:", data.clientSecret);
      } else {
        console.warn("Ответ не содержит clientSecret", data);
        toast.error("Ошибка: не получен ключ оплаты");
      }
    } catch (error) {
      console.error("Ошибка при оплате:", error.response?.data || error.message);
      toast.error('Ошибка при оплате');
    }
  };


  console.log("clientSecret", clientSecret);
  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>Ближайшие записи</p>

      <div>
        {blizhaishie.length === 0 && (
          <p className="text-zinc-500 mt-4">У вас пока нет ближайших записей.</p>
        )}

        {blizhaishie.map((item, index) => {
          const dateParts = item.slotDate.split('_'); // "08_04_2025"
          const readableDate = `${dateParts[0]}.${dateParts[1]}.${dateParts[2]}`;

          return (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={item.appointmentId}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.doctor.image} alt="" />
              </div>

              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.doctor.name}</p>
                <p>{item.doctor.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Адрес:</p>
                <p className='text-xs'>{item.doctor.address.line1}</p>
                <p className='text-xs'>{item.doctor.address.line2}</p>
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>Дата & Время:</span>{' '}
                  {readableDate}, {item.slotTime}
                </p>
              </div>

              <div className='flex flex-col gap-2 flex flex-col gap-2 justify-center items-center'>
                {!item.payment ? (
                  <button
                    onClick={() => handlePay(item.appointmentId)}
                    className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300 justify-end'
                  >
                    Оплатить онлайн
                  </button>
                ) : (
                  <p className='text-xl text-green-600 text-center sm:min-w-48 py-2 rounded justify-center items-center' >
                    Оплачено
                  </p>
                )}

                {!item.cancelled && !item.payment && (
                  <button onClick={() => cancelAppointment(item.appointmentId)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-500 hover:text-white transition-all duration-300'>
                    Отменить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>История</p>

      <div>
        {istoria.length === 0 && (
          <p className="text-zinc-500 mt-4">У вас пока нет истории записей.</p>
        )}

        {istoria.map((item, index) => {
          const dateParts = item.slotDate.split('_'); // "08_04_2025"
          const readableDate = `${dateParts[0]}.${dateParts[1]}.${dateParts[2]}`;

          return (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b opacity-60' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.doctor.image} alt="" />
              </div>

              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.doctor.name}</p>
                <p>{item.doctor.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Адрес:</p>
                <p className='text-xs'>{item.doctor.address.line1}</p>
                <p className='text-xs'>{item.doctor.address.line2}</p>
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>Дата & Время:</span>{' '}
                  {readableDate}, {item.slotTime}
                </p>
              </div>

              <div className='flex flex-col gap-2 justify-center items-center opacity-200'>
                {item.cancelled ? (
                  <p className='text-xl text-zinc-500 text-center sm:min-w-48 py-2 rounded'>
                    Отменен
                  </p>
                ) : item.isCompleted ? (
                  <p className='text-xl text-green-600 text-center sm:min-w-48 py-2 rounded'>
                    Завершен
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}


      </div>
      {
        clientSecret && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              {typeof clientSecret === "string" && clientSecret.length > 0 && (
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                  <CheckoutForm onClose={() => setClientSecret(null)} />
                </Elements>
              )}
            </div>
          </div>
        )
      }
    </div>




  );
};


export default MyAppointments;
