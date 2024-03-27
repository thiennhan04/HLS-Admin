import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import SignIn from "./page/SignIn";
import AuthDetails from "./components/AuthDetails";
import SignUp from "./page/SignUp";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./page/home/Home";
import { AccountManagement } from "./page/accountManagement/AccountManagement";
function App() {
  const [users, setUsers] = useState([]);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/accountManagement" element={<AccountManagement />} />
      </Routes>
    </div>
  );
}

export default App;
