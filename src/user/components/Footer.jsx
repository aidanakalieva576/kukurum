import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

            {/* ------левая часть----- */}
            <div>
                <img className='mb-5 w-40' src={assets.logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>BioCare - забота о жизни. Мы были основаны в 2007 году и стех пор мы улучшаем наше лечение и подход к клентам. Мы будем рады если вы посетите нашу клинику или порекомендуете нас своим друзьям!</p>
            </div>


            {/* ---------центр------- */}
            <div>
                <p className='text-xl font-medium mb-5'>КОМПАНИЯ</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Главная</li>
                    <li>О нас</li>
                    <li>Контакты</li>
                    <li>Конфиденциальность</li>
                </ul>
            </div>


            {/* ------- правая часть ------ */}
            <div>
                <p className='text-xl font-medium mb-5'>СВЯЖИТЕСЬ С НАМИ</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+7-(701)-770-5076</li>
                    <li>BioCare@gmail.com</li>
                </ul>
            </div>



      </div>
      <div>

        {/* ------------ копирайт ----------- */}
        <hr />
        <p className='py-5 text-sm text-center'>© 2025 «BioCare». Все права защищены. Использование материалов допускается с указанием активной ссылки на сайт BioCare.kz</p>
      </div>
    </div>
  )
}

export default Footer
