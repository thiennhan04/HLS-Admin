import React, { useState } from "react";
import "./TabBar.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  UsergroupDeleteOutlined,
  FundOutlined,
  CarOutlined,
  FundViewOutlined,
  FileDoneOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
const TabBar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const handleTabClick = (title) => {
    setActiveTab(title);
  };
  return (
    <div className="tabbar-container">
      <div className="">
        <div className="tabbar-header-gr">
          <div className="tabbar-logo">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/admin_img%2FLogohls.png?alt=media&token=6c34d397-9f75-4748-905c-930ea02deb2b"
              alt=""
              className="tabbar-logo-img"
            />
          </div>
          <div className="tabbar-title-gr">
            <h2 className="tabbar-title-first">Hope Lunch System</h2>
            {/* <div className="tabbar-title-second"></div> */}
          </div>
        </div>
        <div className="tabbar-menu-gr">
          {/* <Link to="/home" className="link-item"> */}
          <div
            className={`tabbar-item-db ${
              activeTab === "Dashboard" ? "tabbar-active " : ""
            }`}
            onClick={() => {
              handleTabClick("Dashboard");
              navigate("/home");
            }}
          >
            <div className="item-icon">
              <HomeOutlined className="tabbar-item-db-icon " />
            </div>
            <div className="tabbar-item-db-title">Dashboard</div>
          </div>
          {/* </Link> */}
          {/* <Link to="/accountManagement"> */}
          <div
            className={`tabbar-item-db ${
              activeTab === "Account Management" ? "tabbar-active " : ""
            }`}
            onClick={() => {
              handleTabClick("Account Management");
              navigate("/accountManagement");
            }}
          >
            <div className="item-icon">
              <UserOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">Account Management</div>
          </div>

          <div
            className={`tabbar-item-db ${
              activeTab === "Bill Management" ? "tabbar-active " : ""
            }`}
            onClick={() => {
              handleTabClick("Bill Management");
              navigate("/billManagement");
            }}
          >
            <div className="item-icon">
              <FileDoneOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">Bill Management</div>
          </div>
          <div
            className={`tabbar-item-db ${
              activeTab === "Children Management" ? "tabbar-active " : ""
            }`}
            onClick={() => {
              handleTabClick("Children Management");
              navigate("/childManagement");
            }}
          >
            <div className="item-icon">
              <UsergroupDeleteOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">Children Management</div>
          </div>
          <div
            className={`tabbar-item-db ${
              activeTab === "News Management" ? "tabbar-active " : ""
            }`}
            onClick={() => {
              handleTabClick("News Management");
              navigate("/newsManagement");
            }}
          >
            <div className="item-icon">
              <FundViewOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">News Management</div>
          </div>
          <div
            className={`tabbar-item-db ${
              activeTab === "Financial Report" ? "tabbar-active " : ""
            }`}
            onClick={() => handleTabClick("Financial Report")}
          >
            <div className="item-icon">
              <FundOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">Financial Report</div>
          </div>

          <div
            className={`tabbar-item-db ${
              activeTab === "Children’s Visitation" ? "tabbar-active " : ""
            }`}
            onClick={() => handleTabClick("Children’s Visitation")}
          >
            <div className="item-icon">
              <CarOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">Children’s Visitation </div>
          </div>
        </div>
      </div>
      <div className="tabbar-footer-gr">
        <div className="admin-avt">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/admin_img%2Favtadmin.jpg?alt=media&token=b5e11ca3-1cc8-4050-9462-bb63038ace22"
            alt=""
            className="admin-avt-img"
          />
          <div className="admin-name">Hien Thu</div>
        </div>

        <div className="admin-logout" onClick={() => navigate("/")}>
          <LogoutOutlined className="logout-icon" />
        </div>
      </div>
    </div>
  );
};

export default TabBar;
