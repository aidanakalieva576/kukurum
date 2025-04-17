import React from 'react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import Chatbox from '../../components/Chatbox/Chatbox'
import RightSidebar from '../../components/RightSidebar/RightSidebar'

const Chat = () => {
  return (
    <div className="h-screen overflow-hidden">
      <div className="w-[100%] h-[100vh] max-w-[1500px] max-h-max bg-[aliceblue] grid grid-cols-[1fr_2fr_1fr]">
        <RightSidebar/>
        <Chatbox/>
        <LeftSidebar/>
      </div>
    </div>
  )
}

export default Chat