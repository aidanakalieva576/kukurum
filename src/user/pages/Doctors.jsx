import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UnifiedContext } from '../../context/UnifiedContext'
import translations from '../../utils'
import axios from 'axios'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const navigate = useNavigate()
  const { doctors, backendUrl, language } = useContext(UnifiedContext)
  const t = translations[language]

  const applyFilter = async () => {
    let filtered = doctors


    if (speciality) {
      filtered = filtered.filter(doc => doc.speciality === speciality)
    }


    if (selectedDate) {
      const formattedDate = new Date(selectedDate)
      const day = formattedDate.getDate().toString().padStart(2, '0')
      const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0')
      // const slotDate = `${formattedDate.getFullYear()}_${month}_${day}`
      const slotDate = `${day}_${month}_${formattedDate.getFullYear()}`

      const availableDoctors = filtered.filter(doc => doc.available)

      const doctorsWithSlots = []
      for (const doc of availableDoctors) {
        try {
          const res = await axios.get(`${backendUrl}/users_api/available-slots/`, {
            params: { docId: doc.id, slotDate }
          })
          const slots = res.data?.availableSlots || []
          if (slots.length > 0) {
            doctorsWithSlots.push(doc)
          }
        } catch (error) {
          console.error(`Ошибка при получении слотов для врача ${doc.id}`, error)
        }
      }

      setFilterDoc(doctorsWithSlots)
    } else {

      setFilterDoc(filtered.filter(doc => doc))
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality, selectedDate])
  console.log("t.speciality['Главный врач']:", t.speciality["Главный врач"]);
  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist</p>
      {/* Новый элемент для выбора даты */}
      <div className="my-5">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded p-2"
        />
      </div>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <div className=' flex flex-col gap-4 text-sm text-gray-600'>
          <p onClick={() => speciality === 'Главный врач' ? navigate(`/doctors`) : navigate('/doctors/Главный врач')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Главный врач" ? "bg-blue-100 text-black" : ""}`} >{t.specialitydoc["Главный врач"]}</p>
          <p onClick={() => speciality === 'Гинеколог' ? navigate(`/doctors`) : navigate('/doctors/Гинеколог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Гинеколог" ? "bg-blue-100 text-black" : ""}`} >{t.specialitydoc["Гинеколог"]}</p>
          <p onClick={() => speciality === 'Дерматолог' ? navigate(`/doctors`) : navigate('/doctors/Дерматолог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Дерматолог" ? "bg-blue-100 text-black" : ""}`} >{t.specialitydoc["Дерматолог"]}</p>
          <p onClick={() => speciality === 'Педиатр' ? navigate(`/doctors`) : navigate('/doctors/Педиатр')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Педиатр" ? "bg-blue-100 text-black" : ""}`} >{t.specialitydoc["Педиатр"]}</p>
          <p onClick={() => speciality === 'Невролог' ? navigate(`/doctors`) : navigate('/doctors/Невролог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Невролог" ? "bg-blue-100 text-black" : ""}`} >{t.specialitydoc["Невролог"]}</p>
          <p onClick={() => speciality === 'Гастроэнтеролог' ? navigate(`/doctors`) : navigate('/doctors/Гастроэнтеролог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Гастроэнтеролог" ? "bg-blue-100 text-black" : ""}`} >{t.specialitydoc["Гастроэнтеролог"]}</p>
        </div>

        <div className='w-full grid grid-cols-auto gap-6 gap-y-6'>
          {
            filterDoc.map((item, index) => (
              <div onClick={() => navigate(`/appointment/doc${item.id}`)}
                className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
                key={index}>
                <img
                  className='bg-blue-50'
                  src={item.image || "/assets/placeholder.jpg"}
                  alt={item.name}
                />
                <div className='p-4'>
                  <div className='flex items-center gap-2 text-sm text-center'>
                    <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></p>
                    <p className={`${item.available ? 'text-green-500' : 'text-red-500'}`}>
                    {item.available ? t.available : t.notAvailable}
                    </p>
                  </div>
                  <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                  <p className='text-gray-600 text-sm'>{t.specialitydoc[item.speciality] || item.speciality}</p>
                  
                </div>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  )
}

export default Doctors
