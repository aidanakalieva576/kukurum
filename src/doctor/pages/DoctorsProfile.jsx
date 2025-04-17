import React, { useContext, useEffect, useState } from 'react';
import { UnifiedContext } from '../../context/UnifiedContext';
import axios from 'axios';

const DoctorProfile = () => {
  const { currency } = useContext(UnifiedContext);
  const [doctor, setDoctor] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
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
        console.error("Ошибка при загрузке данных врача:", error);
      }
    };

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
      setIsEdit(false);
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
    }
  };

  if (!doctor) return <p className="m-5 text-gray-600">Загрузка профиля...</p>;

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
            <p className='text-sm font-medium'>About:</p>
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
            Appointment fee:{' '}
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
            <p>Address</p>
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
            <label>Available</label>
          </div>

          {/* Buttons */}
          {isEdit ? (
            <div className='flex gap-2 mt-5'>
              <button
                onClick={handleSave}
                className='px-4 py-1 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all'
              >
                Save
              </button>
              <button
                onClick={() => setIsEdit(false)}
                className='px-4 py-1 border border-gray-400 text-sm rounded-full'
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className='px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all'
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
