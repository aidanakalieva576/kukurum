import React from 'react'
import { assets } from '../assets/assets'
import translations from '../../utils'
import { useContext } from 'react'
import { UnifiedContext } from '../../context/UnifiedContext'


const About = () => {
  const { language } = useContext(UnifiedContext)
  const t = translations[language]

  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>{t.aboutTitle} <span className='text-gray-700 font-medium'>{t.aboutUs}</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[500px] border border-gray-900' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>{t.aboutText1}</p>
          <p>{t.aboutText2}</p>
          <b className='text-gray-800'>{t.visionTitle}</b>
          <p>{t.visionText}</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>{t.whyTitle} <span className='text-gray-700 font-semibold'>{t.whyUs}</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>{t.efficiencyTitle}</b>
          <p>{t.efficiencyText}</p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>{t.professionalismTitle}</b>
          <p>{t.professionalismText}</p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>{t.personalizationTitle}</b>
          <p>{t.personalizationText}</p>
        </div>
      </div>
    </div>
  )
}

export default About
