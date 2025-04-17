// main.jsx (или index.jsx)
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { BrowserRouter } from "react-router-dom"

// import AppContextProvider from "./context/AppContext.jsx"
// import AdminContextProvider from "./context/AdminContext.jsx"
// // import DoctorContextProvider from "./context/DoctorContext.jsx"

// import AppContextProvider from "./context/AppContext.jsx"
// import AppContextProviderAdmin from "./context/AppContextAdmin.jsx"
import UnifiedContextProvider from "./context/UnifiedContext.jsx"




// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <AdminContextProvider>
//       <DoctorContextProvider>
//         <AppContextProvider>
//           <App />
//         </AppContextProvider>
//       </DoctorContextProvider>
//     </AdminContextProvider>
//   </BrowserRouter>
// )


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UnifiedContextProvider>
      <App />
    </UnifiedContextProvider>
  </BrowserRouter>
)
