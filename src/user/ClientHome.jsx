import React from 'react';
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'

import About from './pages/About'
import Doctors from './pages/Doctors'
import { Outlet } from 'react-router-dom';
// import UserChatPage from './pages/Contact';
import ChatRoom from './components/ChatRoom';


const ClientHome = () => {
  return (
    <div>
      <div className="flex items-start">
        <div className="flex-1">
          <Routes>

            <Route path='my-profile' element={<MyProfile />} />
            <Route path='my-appointments' element={<MyAppointments />} />
            <Route path="chat" element={<ChatRoom />} />
            {/* <Route path="/chat/:id" element={<ChatRoom />} /> */}
            <Route path="chat/:id" element={<ChatRoom />} />

          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClientHome;