import React, { useContext } from 'react';
import { UnifiedContext } from '../../../context/UnifiedContext';
import { useParams } from 'react-router-dom';
import translations from '../../../utils';

const DoctorsList = () => {
  const { speciality } = useParams();
  const { language } = useContext(UnifiedContext); 
  const t = translations[language];
  const { doctors, setDoctors, getDoctorsData } = useContext(UnifiedContext);


  // Фильтрация прямо в рендере
  const filteredDoctors = speciality
    ? doctors.filter(doc => doc.speciality === speciality)
    : doctors;

  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h1 className='text-lg font-medium'>{t.spisok}</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {filteredDoctors.map((item) => (
          <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={item.id}>
            <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={item.image} alt={item.name} />
            <div className='p-4'>
              <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
              <p className='text-zinc-600 text-sm'>{t.specialitydoc[item.speciality] || item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <label>
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={async () => {
                      try {
                        const res = await fetch(`http://localhost:8000/admin/update-doctor-availability/${item.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ docId: item.id }),
                        });

                        if (res.ok) {
                          const updated = await res.json();
                          console.log('Обновлённый врач:', updated);
                          getDoctorsData();
                          setDoctors(prev =>
                            prev.map(doc =>
                              doc.id === updated.docId
                                ? { ...doc, available: updated.available }
                                : doc
                            )
                          );
                        } else {
                          console.error('Ошибка обновления доступности');
                        }
                      } catch (error) {
                        console.error('Ошибка:', error);
                      }
                    }}
                  />
                  <span className='ml-1'>{item.available ? t.available : t.notAvailable}</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
