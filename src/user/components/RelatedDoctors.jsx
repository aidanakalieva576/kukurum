import React, { useContext, useEffect, useState } from 'react'
import { UnifiedContext } from '../../context/UnifiedContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(UnifiedContext)
  const navigate = useNavigate()
  const [relDoc, setRelDoc] = useState([])


  useEffect(() => {
    console.log('Doctors in UnifiedContext:', doctors); // Проверка списка врачей
    console.log('Received docId:', docId); // Проверка docId

    if (doctors.length > 0 && speciality) {
      // Убираем префикс 'doc' из docId и преобразуем его в строку
      const doctorIdNumber = Number(docId.replace('doc', ''));

      console.log('doctorIdNumber:', doctorIdNumber); // Проверка ID
      doctors.forEach(doc => console.log('Doctor ID:', doc.id, 'Type:', typeof doc.id));

      // Фильтруем список врачей по специальности и исключаем текущего врача
      const doctorsData = doctors.filter((doc) =>
        doc.speciality === speciality && doc.id !== doctorIdNumber
      );
      console.log('Filtered doctors:', doctorsData); // Логирование отфильтрованных врачей
      setRelDoc(doctorsData);
    }
  }, [doctors, speciality, docId]);

  return (
    <div>
      <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
        <h1 className='text-3xl font-medium'>Другие врачи</h1>
        <p className='sm:w-1/3 text-center text-sm'>Просмотрите наш обширный список доверенных врачей.</p>
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
          {relDoc.slice(0, 5).map((item, index) => (
            <div
              onClick={() => {
                navigate(`/appointment/${item.id}`);
                scrollTo(0, 0);
              }}
              className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
              key={index}
            >
              <img className='bg-blue-50' src={item.image} alt="" />
              <div className='p-4'>
                <div className='flex items-center gap-2 text-sm text-center'>
                  {item.available ? (
                    <>
                      <p className='w-2 h-2 bg-green-600 rounded-full'></p>
                      <p className='text-green-600'>Доступен</p>
                    </>
                  ) : (
                    <>
                      <p className='w-2 h-2 bg-red-500 rounded-full'></p>
                      <p className='text-red-600'>Не доступен</p>
                    </>
                  )}
                </div>
                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                <p className='text-gray-600 text-sm'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            navigate(`/doctors`);
            scrollTo(0, 0);
          }}
          className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'
        >
          Еще
        </button>
      </div>
    </div>
  );
}

export default RelatedDoctors;
