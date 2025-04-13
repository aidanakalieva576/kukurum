import React, { useContext } from "react";
import { docappointments } from "../../assets/assets_admin/mockdoc";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets_admin/assets";

const DoctorAppointments = () => {
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border-rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {docappointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img className="w-8 rounded-full" src={item.image} alt="" />{" "}
              <p>{item.patient_name}</p>
            </div>
            <span className="text-xs inline-flex items-center justify-center border border-primary px-2 py-0.5 rounded-full whitespace-nowrap h-6 w-[60px] text-center">
              {item.payment}
            </span>
            <p className="max-sm:hidden">{calculateAge(item.dob)}</p>
            <p>
              {slotDateFormat(item.date)}, {item.time}
            </p>
            <p>
              {currency}
              {item.fee}
            </p>
            <div className="flex">
              <img className="w-10 cursor-pointer" src={assets.cancel_icon} alt="" />
              <img className="w-10 cursor-pointer" src={assets.tick_icon} alt="" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
