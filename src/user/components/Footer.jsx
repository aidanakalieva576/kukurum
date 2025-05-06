import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import translations from '../../utils'
import { UnifiedContext } from '../../context/UnifiedContext'

const Footer = () => {
  const { language } = useContext(UnifiedContext)
  const t = translations[language]

  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* ------левая часть----- */}
        <div>
          <a href="/">
            <img className='mb-5 w-40' src={assets.logo} alt="Logo" />
          </a>
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>
            {t.description}
          </p>
        </div>

        {/* ---------центр------- */}
        <div>
          <p className='text-xl font-medium mb-5'>{t.company}</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><a href="/" className="hover:underline">{t.home}</a></li>
            <li><a href="/about" className="hover:underline">{t.about}</a></li>
            <li><a href="/contact" className="hover:underline">{t.contacts}</a></li>
            <li><a href="/doctors" className="hover:underline">{t.doctors}</a></li>
          </ul>
        </div>

        {/* ------- правая часть ------ */}
        <div>
          <p className='text-xl font-medium mb-5'>{t.contactUs}</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+7-(701)-770-5076</li>
            <li>BioCare@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>{t.copyright}</p>
      </div>
    </div>
  )
}

export default Footer
