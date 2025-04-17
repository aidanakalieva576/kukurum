import React from 'react'
import './Chatbox.css'
import profile_img from '../../assets/chatAssets/profile_alison.png'
import green_dot from '../../assets/chatAssets/green_dot.png'
import help_icon from '../../assets/chatAssets/help_icon.png'
import gallery_icon from '../../assets/chatAssets/gallery_icon.png'
import send_button from '../../assets/chatAssets/send_button.png'
import pic1 from '../../assets/chatAssets/pic1.png'

const Chatbox = () => {
  return (
    <div className='chatbox'>
      <div className="chat-user">
        <img src={profile_img} alt="" />
        <p>Alison Bombardino <img className='dot' src={green_dot} alt="" /></p>
        <img src={help_icon} className='help' alt="" />
      </div>

      <div className="chat-msg">
        <div className="s-msg">
          <p className='msg'>Trallallero Trallalla, ***** Dio ***** Allah!!!</p>
          <div>
            <img src={profile_img} alt="" />
            <p>2:20 A.M</p>
          </div>
        </div>
        <div className="s-msg">
          <img src={pic1} className='msg-img' alt="" />
          <div>
            <img src={profile_img} alt="" />
            <p>2:20 A.M</p>
          </div>
        </div>
        <div className="r-msg">
          <p className='msg'>Trallallero Trallalla, ***** Dio ***** Allah!!!</p>
          <div>
            <img src={profile_img} alt="" />
            <p>2:20 A.M</p>
          </div>
        </div>
      </div>





      <div className='chat-input'>
        <input type="text" placeholder='Send a message'/>
        <input type="file" id='image' accept='image/png, image/jpeg' hidden/>
        <label htmlFor="image">
          <img src={gallery_icon} alt="" />
        </label>
        <img src={send_button} alt="" />
      </div>
    </div>
  )
}

export default Chatbox