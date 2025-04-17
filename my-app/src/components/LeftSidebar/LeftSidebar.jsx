import React from "react";
import "./LeftSidebar.css";
import logo from "../../assets/chatAssets/logo.png";
import menu_icon from "../../assets/chatAssets/menu_icon.png";
import search_icon from "../../assets/chatAssets/search_icon.png";
import profile_image from "../../assets/chatAssets/profile_alison.png";

const LeftSidebar = () => {
  return (
    <div className="ls">
      <div className="ls-top">

        <div className="ls-search">
          <img src={search_icon} alt="" />
          <input type="text" placeholder="Search here..." />
        </div>
      </div>
      <div className="ls-list">
        {Array(12)
          .fill("")
          .map((item, index) => (
            <div key={index} className="friends">
              <img src={profile_image} alt="" />
              <div>
                <p>Alison Bombardino</p>
                <span>
                  Bombardillo Coccodrillo, un fottuto alligatore volante,
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
