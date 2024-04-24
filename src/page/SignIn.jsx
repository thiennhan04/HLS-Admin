import React, { useState } from "react";
import { auth, db } from "../firebase-config";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button, message, Space, Alert } from "antd";
import "../page/SignIn.css";
import { Routes, Route, useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Login successful",
    });
  };

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Account not Exists",
    });
  };
  const signIn = async (e) => {
    try {
      e.preventDefault();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;
      const userDoc = doc(db, "Admin", "ADMIN-" + email);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.data();
      // Check if user has admin role
      if (userData && userData.role === "admin") {
        // console.log("User is admin, proceed with login.");
        success();
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        // console.log("User is not an admin, login denied.");
        error();
        // Handle login denied for non-admin users
      }
    } catch (e) {
      console.log(e);
      error();
    }
  };

  return (
    <div className="sign-in-container">
      {contextHolder}
      <div className="wellcom-container">
        <div className="wellcom-header">
          <h1 className="wellcom-first-header">Welcome to </h1>
          <h1 className="wellcom-second-header">Hope Lunch </h1>
          <h1 className="wellcom-last-header">Administration </h1>
          <h2 className="wellcom-dsc">
            Every day try to do at least one good deed for someone else without
            expecting anything in return.
          </h2>
        </div>
        <div className="wellcom-img-container">
          <img
            className="wellcom-img"
            src="https://firebasestorage.googleapis.com/v0/b/hls-react-authen.appspot.com/o/wc1.png?alt=media&token=2807a3f4-9cec-4072-a5ee-e4021ad7dce8"
            alt=""
          />
        </div>
      </div>
      <form className="sign-in-form" onSubmit={signIn}>
        <img
          className="sign-in-img"
          alt=""
          src="https://firebasestorage.googleapis.com/v0/b/hls-react-authen.appspot.com/o/Logohls.png?alt=media&token=9ebf4453-bbdd-48a7-b536-a171df60b1a5"
        />
        <h1 className="sign-in-header">Log In Your Account</h1>
        <div className="sign-in-gr">
          <h2 className="input-label">Email</h2>
          <input
            className="sign-in-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div className="sign-in-gr">
          <h2 className="input-label">Password</h2>
          <input
            type="password"
            className="sign-in-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div></div>
        <button type="submit" className="sign-button">
          Log In
        </button>
      </form>
    </div>
  );
};

export default SignIn;
