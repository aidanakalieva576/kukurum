import React, { useContext, useState } from 'react'
import {assets} from  '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { UnifiedContext } from '../../context/UnifiedContext'

const Navbar = () => {

    const navigate = useNavigate();
    const {token, setToken, userData} = useContext(UnifiedContext)
    const [showMenu, setShowMenu] = useState(false)

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
            <li className='py-1'>Главная</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to = '/doctors'> 
            <li className='py-1'>Доктора</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to= '/about'> 
            <li className='py-1'>О нас</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to = '/contact'> 
            <li className='py-1'>Контакты</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>
      <div className='flex items-center gap-4'>
        {
          token 
          ? <div className='flex items-center gap-2 cursor-pointer group relative'> 
            <img className = 'w-8 h-8 object-cover rounded-full cursor-pointer border-2 border-gray-300' src={userData?.image || assets.profile_pic} alt = ""/>
            <img className = 'W-2.5' src = {assets.dropdown_icon} alt ="" />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'> 
                  <p onClick={()=> navigate('/user/my-profile')} className='hover:text-black cursor-pointer'>Мой профиль</p>
                  <p onClick={()=> navigate('/user/my-appointments')} className='hover:text-black cursor-pointer'>Мои записи</p>
                  <p onClick = {logout} className='hover:text-black cursor-pointer'>Выйти</p>
                </div>
            </div>
            </div>

  
          :<button onClick= {()=>navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create account</button>
        }
        
        
      </div>
    </div>
  )
}

export default Navbar
