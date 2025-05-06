import React, { useContext, useState, useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import { UnifiedContext } from '../../context/UnifiedContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import translations from '../../utils'
import * as faceapi from 'face-api.js'

const Login = () => {
  const { backendUrl, token, setToken, language } = useContext(UnifiedContext)
  const t = translations[language]
  const navigate = useNavigate()

  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [faceBlob, setFaceBlob] = useState(null)
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const toastSuccess = () => toast.success(t.successLogin)
  const closeModal = () => setModalMode(null)

  const handleScreenshot = async () => {
    const screenshot = webcamRef.current?.getScreenshot()
    if (!screenshot) {
      toast.error(t.faceIDError || 'Ошибка при получении изображения')
      return null
    }
    return await (await fetch(screenshot)).blob()
  }

  const handleFaceIDLogin = async () => {
    const blob = await handleScreenshot()
    if (!blob) return

    try {
      const formData = new FormData()
      formData.append('image', blob, 'face.jpg')

      const { data } = await axios.post(`${backendUrl}/face/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (data.token && data.role) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        setToken(data.token)
        toastSuccess()
        closeModal()
        navigate(data.role === 'admin' ? '/admin' : data.role === 'doctor' ? '/doctor' : '/')
      } else {
        toast.error(t.errorLogin)
      }
    } catch (err) {
      toast.error(t.faceIDError || 'Ошибка FaceID')
      console.error("Ошибка FaceID входа:", err)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (state === 'Sign Up') {
      try {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('password', password)
        if (faceBlob) formData.append('file', faceBlob, 'face.jpg')

        const { data } = await axios.post(`${backendUrl}/register`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (data.token && data.role) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('role', data.role)
          setToken(data.token)
          toastSuccess()
          navigate(data.role === 'admin' ? '/admin' : data.role === 'doctor' ? '/doctor' : '/')
        } else {
          toast.error(t.errorLogin)
        }
      } catch (error) {
        toast.error(error.response?.data?.detail || t.errorTryAgain)
        console.error("Ошибка при регистрации:", error.response?.data || error.message)
      }
    } else {
      try {
        const { data } = await axios.post(`${backendUrl}/login`, { email, password })

        if (data.token && data.role) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('role', data.role)
          setToken(data.token)
          toastSuccess()
          navigate(data.role === 'admin' ? '/admin' : data.role === 'doctor' ? '/doctor' : '/')
        } else {
          toast.error(t.errorLogin)
        }
      } catch (error) {
        toast.error(error.response?.status === 400 ? t.wrongCredentials : t.errorTryAgain)
        console.error("Ошибка при логине:", error)
      }
    }
  }

  const handleRegistrationWithPhoto = async () => {
    const blob = await handleScreenshot()
    if (blob) {
      setFaceBlob(blob)
      toast.success(t.faceIDSaved || 'Фото сохранено')
      closeModal()
    }
  }

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        console.log('Модели успешно загружены')
      } catch (err) {
        console.error('Ошибка при загрузке моделей face-api:', err)
      }
    }
    loadModels()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      const video = webcamRef.current?.video
      const canvas = canvasRef.current
      if (!video || !canvas) return
  
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
  

      if (videoWidth === 0 || videoHeight === 0) {
        return 
      }
  
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
  

        if (detections.length === 0) {
          return
        }
  

        const displaySize = { width: videoWidth, height: videoHeight }
        faceapi.matchDimensions(canvas, displaySize)

        const resized = faceapi.resizeResults(detections, displaySize)
        const ctx = canvas.getContext('2d')
  

        ctx.clearRect(0, 0, canvas.width, canvas.height)
  
        resized.forEach((detection) => {
          try {
            const { x, y, width, height } = detection.detection.box
  
            // Проверяем, что координаты и размеры прямоугольника валидны
            if (x != null && y != null && width != null && height != null && width > 0 && height > 0) {
              ctx.strokeStyle = 'blue'
              ctx.lineWidth = 2
              ctx.strokeRect(x, y, width, height)
            }
  
            // Рисуем кастомные точки (landmarks) для декора
            const landmarks = detection.landmarks.positions
            landmarks.forEach((point) => {

              if (point.x != null && point.y != null) {
                ctx.beginPath()
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2)  
                ctx.fillStyle = 'white'
                ctx.fill()
              }
            })
          } catch (err) {
            console.error('Ошибка при рисовании прямоугольника или точек:', err)
          }
        })
      } catch (err) {
        console.error('Ошибка при обработке лиц:', err)
      }
    }, 100)
  
    return () => clearInterval(interval)
  }, [])



  return (
    <>
<form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
  <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
    <p className='text-2xl font-semibold'>
      {state === 'Sign Up' ? t.createAccount : t.login}
    </p>
    <p>{t.please} {state === 'Sign Up' ? t.register : t.signInToBook}</p>

    {state === 'Sign Up' && (
      <div className='w-full'>
        <p>{t.fullName}</p>
        <input
          className='border border-zinc-300 rounded w-full p-2 mt-1'
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
      </div>
    )}

    <div className='w-full'>
      <p>{t.email}</p>
      <input
        className='border border-zinc-300 rounded w-full p-2 mt-1'
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />
    </div>

    <div className='w-full'>
      <p>{t.password}</p>
      <input
        className='border border-zinc-300 rounded w-full p-2 mt-1'
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        required
      />
    </div>

    <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
      {state === 'Sign Up' ? t.createAccount : t.login}
    </button>

    {state === 'Login' && (
      <div className='w-full text-center mt-2'>
        <p>{t.orLoginWithFaceID || 'Или войдите с помощью FaceID'}</p>
        <button onClick={() => setModalMode('login')} className='flex justify-center mt-2 mx-auto'>
          <img src="https://www.svgrepo.com/show/325179/face-id.svg" alt="Face ID" className="w-10 h-10" />
        </button>
      </div>
    )}

    {state === 'Sign Up' && (
      <div className='w-full text-center mt-2'>
        <p>{t.orRegisterWithFaceID || 'Или зарегистрируйтесь с FaceID'}</p>
        <button
  type="button"
  onClick={() => setModalMode('register')}
  className='flex justify-center mt-2 mx-auto'
>
  <img src="https://www.svgrepo.com/show/325179/face-id.svg" alt="Face ID" className="w-10 h-10" />
</button>
      </div>
    )}



          <p>
            {state === 'Sign Up'
              ? <>{t.haveAccount} <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>{t.loginHere}</span></>
              : <>{t.newAccount} <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>{t.clickHere}</span></>}
          </p>
        </div>
      </form>

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm">
            <div className='relative w-full'>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className='rounded-md border w-full'
                videoConstraints={{ facingMode: 'user' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button 
                onClick={modalMode === 'register' ? handleRegistrationWithPhoto : handleFaceIDLogin}
                className="bg-primary hover:bg-darkprimary text-white w-full py-2 rounded-md transition"
              >
                {modalMode === 'register' ? (t.createAccount || 'Создать аккаунт') : (t.loginWithFaceID || 'Войти')}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full py-2 rounded-md transition"
              >
                {t.cancel || 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Login
