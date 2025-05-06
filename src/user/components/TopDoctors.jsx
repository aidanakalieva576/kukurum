import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedContext } from '../../context/UnifiedContext';
import translations from '../../utils';

const DoctorCard = ({ item }) => {
    const navigate = useNavigate();
    const { language } = useContext(UnifiedContext);
    const t = translations[language];


    return (
        <div
            onClick={() => {
                console.log("Доктор в списке:", item);
                navigate(`/appointment/doc${item.id}`);
                window.scrollTo(0, 0);
            }}
            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
        >
            <img className='bg-blue-50 w-full h-60 object-cover' src={item.image || "/assets/placeholder.jpg"} alt={item.name} />
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
    );
};

const TopDoctors = () => {
    const navigate = useNavigate();
    const { language, doctors } = useContext(UnifiedContext);
    const t = translations[language];

    useEffect(() => {
        console.log("Doctors updated:", doctors);
    }, [doctors]);

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>{t.topDoctorsTitle}</h1>
            <p className='sm:w-1/3 text-center text-sm'>{t.topDoctorsDescription}</p>

            <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {doctors && doctors.length > 0 ? (
                    doctors.slice(0, 10).map((item, index) => (
                        <DoctorCard key={index} item={item} />
                    ))
                ) : (
                    <p>Доктора не загружены</p>
                )}
            </div>

            <button
                onClick={() => {
                    navigate(`/doctors`);
                    window.scrollTo(0, 0);
                }}
                className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'
            >
                {t.more}
            </button>
        </div>
    );
};


export default TopDoctors;
