import React from 'react'
import { assets } from '../assets/assets'
import translations from '../../utils'
import { UnifiedContext } from '../../context/UnifiedContext'
import { useContext } from 'react'


const Header = () => {
    const { language } = useContext(UnifiedContext)
    const t = translations[language]
    return (
        <div className='flex flex-col md:flex-row flex-wrap bg-primary rounded-lg pl-6 md:pl-10 lg:pl-20 relative'>
          {/* ----------- левая часть ------------ */}
          <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 py-10 md:py-[10vw] md:mb-[-30px]'>
            <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
              {t.title} <br /> {t.title2}
            </p>
            <div className='flex flex-col md:flex-row items-center gap-6 text-white text-sm font-light'>
              <img className='w-28' src={assets.group_profiles} alt="" />
              <p>{t.subtitle} <br className='hidden sm:block' /> {t.subtitle2}</p>
            </div>
            <a href="#speciality" className='flex items-center gap-6 bg-white px-8 py-3 rounded-full font-semibold text-gray-800 text-lg md:m-0 hover:scale-105 transition-all duration-300'>
              {t.zapisatsya} <img className='w-3' src={assets.arrow_icon} alt="" />
            </a>
          </div>
    
          {/* ------- правая часть -------- */}
          <div className="md:w-1/2 relative flex justify-end">
            <img className="flex w-[800px] max-w-none h-auto absolute right-0 bottom-0" 
                 src={assets.header_img} 
                 alt="Doctor" />
          </div>
        </div>
      )
    }
    

export default Header
