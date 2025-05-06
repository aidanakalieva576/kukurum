import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './user/pages/Login'
import MyProfile from './user/pages/MyProfile'
import MyAppointments from './user/pages/MyAppointments'
import Appointment from './user/pages/Appointment'
import Navbar from './user/components/Navbar'
import About from './user/pages/About'
import Doctors from './user/pages/Doctors'
import Footer from './user/components/Footer'
import { ToastContainer } from 'react-toastify'
import PrivateRoute from './user/PrivateRoute'
import ClientHome from './user/ClientHome'
import AdminHome from './admin/pages.admin/AdminHome'
import DoctorPage from './doctor/DoctorHome'
import Home from './user/pages/Home'
import SkeletonAssistant from './user/components/Skeleton' // <— Импорт скелета

const App = () => {
  const location = useLocation()
  const role = localStorage.getItem('role')

  const path = location.pathname

  const isLogin = path === '/login'
  const isAdmin = path.startsWith('/admin')
  const isDoctor = path.startsWith('/doctor')
  const isChat = path.includes('/user/chat/ai');


  const showLayout = role === 'user' || !role
  const path1 = location.pathname;

  const skeletonPaths = [
    '/', // главная
    '/doctors',
    '/about',
    '/user/my-profile',
    '/user/my-appointments',
    '/user/chat'
  ];

const showSkelet = skeletonPaths.includes(path1);
const showSkeleton =
  skeletonPaths.includes(path1) && path1 !== '/user/chat/ai' && !isLogin && !isAdmin && !isDoctor;


  return (
    <div className='mx-4 sm:mx-[10%]'>
      {showLayout && <Navbar />}
      {showSkeleton && <SkeletonAssistant />} {/* <— Выводим скелет */}
      <ToastContainer />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='' element={<Home />} />
        <Route path='doctors' element={<Doctors />} />
        <Route path='doctors/:speciality' element={<Doctors />} />
        <Route path='about' element={<About />} />
        <Route path='appointment/:docId' element={<Appointment />} />

        <Route
          path='/admin/*'
          element={
            <PrivateRoute requiredRole="admin">
              <AdminHome />
            </PrivateRoute>
          }
        />
        <Route
          path='/doctor/*'
          element={
            <PrivateRoute requiredRole="doctor">
              <DoctorPage />
            </PrivateRoute>
          }
        />
        <Route
          path='/user/*'
          element={
            <PrivateRoute requiredRole="user">
              <ClientHome />
            </PrivateRoute>
          }
        />
      </Routes>
      {showLayout && <Footer />}
    </div>
  )
}

export default App