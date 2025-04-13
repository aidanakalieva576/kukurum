import React, { useContext } from 'react'
import { assets, doctors } from '../../assets/assets_frontend/assets'
import { AppContext } from '../../context/AppContext';

const DoctorProfile = () => {
  const doctor = doctors[0]; // Вытаскиваем первого доктора
  const { currency } = useContext(AppContext);
  // const [isEdit, setIsEdit ] = useState(false);

  return (
    <div>
      <div className='flex flex-col gap-4 m-5'>
        <div>
          <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={doctor.image} alt={doctor.name} />
        </div>
        <div className='flex-1 border border-stone-100 rounded-lg p-8 pu-7 bg-white'>
          {/* doc info: name, degree, experience */}
          <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{doctor.name}</p>
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p>{doctor.degree} - {doctor.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{doctor.experience}</button>
          </div>

          {/* doctor about  */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3'>About:</p>
            <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{doctor.about}</p>
          </div>


          <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currency} {doctor.fees} </span></p>
          <div className='flex gap-2 py-2'>
            <p>Address</p>
            <p className='text-sm'>
              {doctor.address.line1}
              <br />
              {doctor.address.line2}
              </p>
          </div>

          <div className='flex gap-1 pt-2'>
            <input type="checkbox" /> {/* здесь должно быть проперти с checked={profileData.availab} */}
            <label htmlFor="">Available</label>
          </div>

          <button className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'>Edit</button>


        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
