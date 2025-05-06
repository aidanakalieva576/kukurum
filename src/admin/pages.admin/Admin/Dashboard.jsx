import React, { useContext } from 'react';
import { assets } from '../../assets.admin/assets_admin/assetsadmin.js';
import { useState } from 'react';
import { useEffect } from 'react';
import translations from '../../../utils.jsx';

import { UnifiedContext } from '../../../context/UnifiedContext.jsx';

const Dashboard = () => {
  const { language } = useContext(UnifiedContext);
  const t = translations[language];
  const { slotDateFormat } = useContext(UnifiedContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('http://localhost:8000/admin/getting_appointments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // если нужно
          }
        });
        const data = await res.json();
        setAppointments(data.active_appointments || []); // или можешь добавить оба массива
      } catch (err) {
        console.error('Ошибка при получении данных:', err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{appointments.length}</p>
            <p className='text-gray-400'>{t.doctors}</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{appointments.length}</p>
            <p className='text-gray-400'>{t.allapp}</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{appointments.length}</p>
            <p className='text-gray-400'>{t.patients}</p>
          </div>
        </div>
      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>{t.latestapp}</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {appointments.map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
              <img className='rounded-full w-10' src={item.doctor_image} alt="doctor" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.doctor_name}</p>
                <p className='text-gray-600'>{slotDateFormat(item.date)} at {item.time}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
