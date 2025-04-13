import React, { useContext } from "react";
import { assets } from "../../assets/assets_admin/assets";
import { docappointments } from "../../assets/assets_admin/mockdoc";
import { AppContext } from "../../context/AppContext";

const DashboardDoctor = () => {
  const { currency, slotDateFormat } = useContext(AppContext);

  return (
    <div className="m-5">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.earning_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {currency} 234
            </p>
            <p className="text-gray-400">Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {docappointments.length}
            </p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {docappointments.length}
            </p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
          <img src={assets.list_icon} alt="" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="pt-4 border border-t-0">
          {docappointments.map((item, index) => (
            <div
              className="flex justify-between items-center px-6 py-3 gap-3 hover:bg-gray-100"
              key={index}
            >
              <div className="flex items-center gap-3">
                <img
                  className="rounded-full w-10"
                  src={item.image}
                  alt="patient"
                />
                <div className="text-sm">
                  <p className="text-gray-800 font-medium">
                    {item.patient_name}
                  </p>
                  <p className="text-gray-600">
                    {slotDateFormat(item.date)} at {item.time}
                  </p>
                </div>
              </div>
              <p className="text-red-500 text-sm">cancelled</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardDoctor;
