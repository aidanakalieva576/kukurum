import React, { useContext, useState } from 'react'
import {assets} from  '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { UnifiedContext } from '../../context/UnifiedContext'
import translations from '../../utils'

const Navbar = () => {

    const navigate = useNavigate();
    const {token, setToken, userData, language, setLanguage} = useContext(UnifiedContext)
    const t = translations[language];
    

    const logout = ()=> {
      setToken(false)
      localStorage.removeItem('token')
    }


// to="/admin/dashboard"
  return (
    <div className='flex items-center justify-between text-lm py-4 mb-5 border-b border-b-gray-400'>
      <img onClick={()=>navigate(`/`)} className = 'w-40 cursor-pointer'src = {assets.logo} alt="" />
      <ul className='font-semibold hidden md:flex items-start gap-10 font-medium mr-[75px]'>
        <NavLink to='/'> 
            <li className='py-1'>{t.home}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to = '/doctors'> 
            <li className='py-1'>{t.doctors}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>

        <NavLink to = '/user/chat'> 
            <li className='py-1'>{t.contacts}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to= '/about'> 
            <li className='py-1'>{t.about}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>
      <div className='flex items-center gap-4'>
  {/* Language Switcher */}
  <div className="relative group cursor-pointer">
    <img
      className="w-5 h-5 opacity-70"
      src={assets.ball}
      alt="language"
    />
    <div className="absolute right-0 pt-3 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
      <div className="min-w-32 bg-stone-100 rounded flex flex-col gap-2 p-3">
        <p
          onClick={() => setLanguage("ru")}
          className={`hover:text-black cursor-pointer ${language === "ru" ? "font-semibold" : ""}`}
        >
          RU
        </p>
        <p
          onClick={() => setLanguage("en")}
          className={`hover:text-black cursor-pointer ${language === "en" ? "font-semibold" : ""}`}
        >
          EN
        </p>
      </div>
    </div>
  </div>

  {/* Profile / Login */}
  {
    token ? (
      <div className='flex items-center gap-2 cursor-pointer group relative'>
        <img
          className='w-9 h-9 object-cover rounded-full cursor-pointer border-2 border-gray-300'
          src={userData?.image || assets.profile_pic}
          alt=""
        />
        <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
          <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
            <p onClick={() => navigate('/user/my-profile')} className='hover:text-black cursor-pointer'>{t.profile}</p>
            <p onClick={() => navigate('/user/my-appointments')} className='hover:text-black cursor-pointer'>{t.appointments}</p>
            <p onClick={logout} className='hover:text-black cursor-pointer'>{t.logout}</p>
          </div>
        </div>
      </div>
    ) : (
      <button
        onClick={() => navigate('/login')}
        className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'
      >
        {t.createAccount}
      </button>
    )
  }

      </div>
    </div>
  )
}

export default Navbar
