import React, { useState, useEffect } from "react";
import "./TabBar.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase-config";
import { getAuth } from "firebase/auth";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  HomeOutlined,
  UserOutlined,
  UsergroupDeleteOutlined,
  FundOutlined,
  CarOutlined,
  FundViewOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
const TabBar = ({ activeTab, setActiveTab }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avt_admin, setAvt] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  useEffect(() => {
    const fetchAdminData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userEmail = user.email;
        const adminRef = doc(db, "Admin", "ADMIN-" + userEmail);
        try {
          const adminDoc = await getDoc(adminRef);
          if (adminDoc.exists()) {
            // setFirstName[adminDoc.data().firstname_admin];
            // setLastName[adminDoc.data().lastname_admin];
            // setAvt[adminDoc.avt_admin];
            setFirstName(adminDoc.data().firstname_admin);
            setLastName(adminDoc.data().lastname_admin);
            setAvt(adminDoc.data().avatar_admin);
            // console.log("Admin data:", adminDoc.data().firstname_admin);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
        }
      }
    };

    // Lập lại việc gọi fetchAdminData mỗi 10 giây
    const intervalId = setInterval(fetchAdminData, 20000);

    // Gọi fetchAdminData ngay khi component mount
    fetchAdminData();

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, [auth]);

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
            onClick={() => {
              handleTabClick("Financial Report");
              navigate("/financialReport");
            }}
          >
            <div className="item-icon">
              <FundOutlined className="tabbar-item-db-icon" />
            </div>
            <div className="tabbar-item-db-title">Financial Report</div>
          </div>

          <div
            className={`tabbar-item-db ${
              activeTab === "Children’s Visitation" ? "tabbar-active" : ""
            }`}
            onClick={() => handleTabClick("Children’s Visitation")}
          >
            <div className="item-icon">
              <CarOutlined className="tabbar-item-db-icon" />
            </div>
            <div
              className="tabbar-item-db-title"
              onClick={() => {
                handleTabClick("Calendar Management");
                navigate("/calendarManagement");
              }}
            >
              Children’s Visitation
            </div>
          </div>
          {/* <div
            className={`tabbar-item-db ${
              activeTab === "Volunteer Participation" ? "tabbar-active" : ""
            }`}
            onClick={() => handleTabClick("Volunteer Participation")}
          >
            <div className="item-icon">
              <IdcardOutlined className="tabbar-item-db-icon" />
            </div>
            <div
              className="tabbar-item-db-title"
              onClick={() => {
                handleTabClick("Volunteer Participation");
                navigate("/volunteerParticipation");
              }}
            >
              Volunteer Participation
            </div>
          </div> */}
        </div>
      </div>
      <div className="tabbar-footer-gr">
        <div className="admin-avt">
          <img src={avt_admin} alt="" className="admin-avt-img" />
          <div className="admin-name">{firstName + " " + lastName}</div>
        </div>

        <div className="admin-logout" onClick={() => navigate("/")}>
          <LogoutOutlined className="logout-icon" />
        </div>
      </div>
    </div>
  );
};

export default TabBar;
