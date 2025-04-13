import { Routes, Route } from "react-router-dom";
import ComLogin from "./components/Login/ComLogin";
import "./index.css";
import AdminHome from "./pages/AdminHome";
import DoctorHome from "./pages/Doctor/DoctorHome";
import DashboardDoctor from "./pages/Doctor/DashboardDoctor";
const App = () => {
  return (
    <Routes>
      {/* Маршруты для логина и админки */}
      <Route path="/" element={<ComLogin />} />
      <Route path="/Home/*" element={<AdminHome />} />
      <Route path='/doctor-dashboard' element={<DashboardDoctor/>}/>
      {/* Докторская колбаса блять сука нахуй я щас себе палец в жопу засуну*/}
      <Route path='/doctor/*' element={<DoctorHome/>} />
    </Routes>
  );
};

export default App;




