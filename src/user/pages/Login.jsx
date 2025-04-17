import React, { useContext, useState, useEffect } from 'react'
import { UnifiedContext } from '../../context/UnifiedContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'


const Login = () => {
  const { backendUrl, token, setToken } = useContext(UnifiedContext)
  const navigate = useNavigate()
  console.log("backendUrl в Login.jsx:", backendUrl);



  // Toast success function
  const toastSuccess = (message) => toast.success("Вы вошли!");

  const [state, setState] = useState('Sign Up')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/users_api/register`, {
          name,
          password,
          email
        })

        if (data.token && data.role) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('role', data.role)
          setToken(data.token)
          toastSuccess("Добро пожаловать! Вход выполнен успешно.")

          // Навигация по ролям
          if (data.role === 'admin') {
            navigate('/admin')
          } else if (data.role === 'doctor') {
            navigate('/doctor')
          } else {
            navigate('/')
          }
        } else {
          toast.error("Ошибка при входе. Попробуйте снова.")
        }
      } 
      else {
        const { data } = await axios.post(`${backendUrl}/login`, {
          email,
          password
        })
    
        if (data.token && data.role) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('role', data.role) // ✅ Добавь это!
          setToken(data.token)
          toastSuccess("Добро пожаловать! Вход выполнен успешно.")
          console.log("role:", data.role)
        
          // Навигация по ролям
          if (data.role === 'admin') {
            navigate('/admin')
          } else if (data.role === 'doctor') {
            navigate('/doctor')
          } else {
            navigate('/')
          }
        }
         else {
          toast.error("Ошибка при входе. Попробуйте снова.");
        }
      }
    }
     catch (error) {
      if (error.response && error.response.status === 400) {
        if (state === 'Sign Up') {
          toast.error("Аккаунт с такой почтой уже существует.");
        } else {
          toast.error("Неверная почта или пароль.");
        }
      } else {
        toast.error("Ошибка при входе или регистрации. Попробуйте снова.");
      }
      console.error("Ошибка при логине/регистрации:", error);
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/user')
    }
  }, [])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80hv] flex items-center '>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded=xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Создать аккаунт" : "Войти"}</p>
        <p>Пожалуйста {state === 'Sign Up' ? "зарегистрируйтесь" : "войдите"} для записи</p>
        {
          state === "Sign Up" && <div className='w-full'>
            <p>ФИ</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setName(e.target.value)} value={name} required />
          </div>
        }

        <div className='w-full'>
          <p>Почта</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
        </div>

        <div className='w-full'>
          <p>Пароль</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state === 'Sign Up' ? "Создать аккаунт" : "Войти"}</button>

        {
          state === "Sign Up"
            ? <p>Уже есть аккаунт? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Войти здесь</span></p>
            : <p>Создать новый аккаунт? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Нажмите сюда</span></p>
        }
      </div>
    </form>
  )
}

export default Login
