import { Routes, Route } from "react-router-dom";
import ComLogin from "./components/Login/ComLogin";
import AdminHome from "./pages/AdminHome";
import "./index.css";


const App = () => {

  return (
    <Routes>
      <Route path="/" element={<ComLogin />} />
      <Route path="/Home/*" element={<AdminHome />} />
    </Routes>

  );
};

export default App;




