import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import SignIn from "./page/SignIn";
import AuthDetails from "./components/AuthDetails";
import SignUp from "./page/SignUp";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./page/home/Home";
import { AccountManagement } from "./page/accountManagement/AccountManagement";
import BillManagement from "./page/billManagement/BillManagement";
import ChildManagement from "./page/childManagement/ChildManagement";
import NewsManagement from "./page/newsManagement/NewsManagement";
import CalendarManagement from "./page/calendarManagement/CalendarManagement";
import FinanceReport from "./page/financeReport/FinanceReport";
import VolunteerParticipation from "./page/volenteerManagement/VolunteerParticipation";
function App() {
  const [users, setUsers] = useState([]);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/accountManagement" element={<AccountManagement />} />
        <Route path="/billManagement" element={<BillManagement />} />
        <Route path="/childManagement" element={<ChildManagement />} />
        <Route path="/newsManagement" element={<NewsManagement />} />
        <Route path="/calendarManagement" element={<CalendarManagement />} />
        <Route path="/financialReport" element={<FinanceReport />} />
        <Route
          path="/volunteerParticipation"
          element={<VolunteerParticipation />}
        />
      </Routes>
    </div>
  );
}

export default App;
