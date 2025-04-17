import React from 'react'
import './RightSidebar.css'
import profile_img from '../../assets/chatAssets/profile_alison.png'
import green_dot from '../../assets/chatAssets/green_dot.png'
import pic1 from '../../assets/chatAssets/pic1.png'
import pic2 from '../../assets/chatAssets/pic2.png'
import pic3 from '../../assets/chatAssets/pic3.png'
import pic4 from '../../assets/chatAssets/pic4.png'

const RightSidebar = () => {
  return (
    <div className='rs'>
      <div className='rs-profile'>
        <img src={profile_img} alt="" />
        <h3>Alison Bombardino <img src={green_dot} className="dot" alt="" /></h3>
        <p>Oh Holero Freddy Fazbera</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          <img src={pic1} alt="" />
          <img src={pic2} alt="" />
          <img src={pic3} alt="" />
          <img src={pic4} alt="" />
          <img src={pic1} alt="" />
          <img src={pic2} alt="" />
        </div>
      </div>
    </div>
  )
}

export default RightSidebar