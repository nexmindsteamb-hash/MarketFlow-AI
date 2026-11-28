import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

import Signup from "./Pages/auth/Signup";
import Login from "./Pages/auth/Login";

import Dashboard from "./Pages/dashboard/Dashboard";
import CompanyData from "./Pages/dashboard/CompanyData";
import ContentStudio from "./Pages/dashboard/ContentStudio";
import Campaigns from "./Pages/dashboard/Campaigns";
import Approvals from "./Pages/dashboard/Approvals";
import SocialAccounts from "./Pages/dashboard/SocialAccounts";
import Calendar from "./Pages/dashboard/Calendar";
import Analytics from "./Pages/dashboard/Analytics";
import Settings from "./Pages/dashboard/Settings";

import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {

  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((res) => {
        console.log("Backend connected:", res.data.message);
      })
      .catch((err) => {
        console.error("Backend connection failed:", err.message);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard and Nested Pages */}
        <Route path="/dashboard" element={<DashboardLayout />}>

          <Route index element={<Dashboard />} />

          <Route path="company-data" element={<CompanyData />} />
          <Route path="content-studio" element={<ContentStudio />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="social-accounts" element={<SocialAccounts />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}


// import { useEffect, useState } from "react";
// import { checkBackendHealth } from "./services/api";

// function App() {
//   const [backendStatus, setBackendStatus] = useState("Checking...");

//   useEffect(() => {
//     checkBackendHealth()
//       .then((data) => {
//         setBackendStatus(data.message);
//       })
//       .catch(() => {
//         setBackendStatus("Backend connection failed");
//       });
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center">
//       <h1 className="text-3xl font-bold">
//         MarketFlow AI
//       </h1>

//       <p className="mt-4">
//         Backend Status: {backendStatus}
//       </p>
//     </div>
//   );
// }

// export default App;
