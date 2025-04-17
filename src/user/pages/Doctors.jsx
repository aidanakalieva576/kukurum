import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UnifiedContext } from '../../context/UnifiedContext'

const Doctors = () => {

  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const navigate = useNavigate()
  const { doctors } = useContext(UnifiedContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }
  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])
  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <div className=' flex flex-col gap-4 text-sm text-gray-600'>
          <p onClick={() => speciality === 'Главный врач' ? navigate(`/doctors`) : navigate('/doctors/Главный врач')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Главный врач" ? "bg-blue-100 text-black" : ""}`} >Главный врач</p>
          <p onClick={() => speciality === 'Гинеколог' ? navigate(`/doctors`) : navigate('/doctors/Гинеколог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Гинеколог" ? "bg-blue-100 text-black" : ""}`} >Гинеколог</p>
          <p onClick={() => speciality === 'Дерматолог' ? navigate(`/doctors`) : navigate('/doctors/Дерматолог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Дерматолог" ? "bg-blue-100 text-black" : ""}`} >Дерматолог</p>
          <p onClick={() => speciality === 'Педиатр' ? navigate(`/doctors`) : navigate('/doctors/Педиатр')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Педиатр" ? "bg-blue-100 text-black" : ""}`} >Педиатр</p>
          <p onClick={() => speciality === 'Невролог' ? navigate(`/doctors`) : navigate('/doctors/Невролог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Невролог" ? "bg-blue-100 text-black" : ""}`} >Невролог</p>
          <p onClick={() => speciality === 'Гастроэнтеролог' ? navigate(`/doctors`) : navigate('/doctors/Гастроэнтеролог')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Гастроэнтеролог" ? "bg-blue-100 text-black" : ""}`} >Гастроэнтеролог</p>
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
                      {item.available ? 'Доступен' : 'Недоступен'}
                    </p>
                  </div>
                  <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                  <p className='text-gray-600 text-sm'>{item.speciality}</p>
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
