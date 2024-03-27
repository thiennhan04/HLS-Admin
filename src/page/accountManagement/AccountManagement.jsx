import React, { useState, useEffect } from "react";
import TabBar from "../../components/tabbar/TabBar";
import { getDocs, collection } from "firebase/firestore";
import "./AccountManagement.css";
import { db } from "../../firebase-config";
// import { useState } from "react";
import { Space, Table, Tag, Input, Button } from "antd";
import { PlusOutlined, AudioOutlined } from "@ant-design/icons";
import EditAccountForm from "../../components/account/EditAccountForm";
const { Search } = Input;
// Design cho nút tìm kiếm

const onSearch = (value, _e, info) => console.log(info?.source, value);

export const AccountManagement = () => {
  const [accountData, setAccountData] = useState([]);
  const [editForm, setEditForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Account User",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Children Care Code",
      dataIndex: "ccc",
      key: "ccc",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, tag) => {
        console.log(tag.status);
        let statusText = tag.status === "true" ? "Banned" : "Active";
        let color = tag.status === "true" ? "volcano" : "green";

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const handleEditClick = (record) => {
    setEditForm(true);
    setSelectedRecord(record);
  };

  //Lấy dữ liệu từ collection firebase
  const fetchData = async () => {
    const count = 0;
    const querySnapshot = await getDocs(collection(db, "account_info"));
    // console.log(querySnapshot);
    const res = [];
    querySnapshot.forEach((account) => {
      res.push({
        // key: count,
        id: account.id,
        email: account.data().account_user,
        firstname: account.data().firstname_user,
        lastname: account.data().lastname_user,
        name:
          account.data().firstname_user + " " + account.data().lastname_user,
        ccc: account.data().childadoptioncode_children,
        phone: account.data().phone_user,
        role: account.data().role_user,
        province: account.data().province_user,
        status: account.data().banned_user ? "true" : "false",
      });
    });

    setAccountData(res);
    try {
    } catch (error) {
      console.error("Error fetching data:");
    }
  };
  //
  // fetchData();
  const [activeTab, setActiveTab] = useState("Account Management");
  return (
    <div className="account-container">
      <EditAccountForm
        isvisible={editForm}
        setEditForm={setEditForm}
        accountSelect={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        handleFCancel={() => {
          setSelectedRecord(null);
        }}
      />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="account-body">
        <div className="account-header-gr">
          <h1 className="account-header">Account Management</h1>
          <Space direction="vertical" className="account-input">
            <Search
              className="input-search"
              placeholder="input search text"
              onSearch={onSearch}
              enterButton
              style={{
                width: 300,
                height: 100,
              }}
            />
          </Space>
        </div>
        <button className="add-account-btn">
          <PlusOutlined />
          Add Account
        </button>
        <div className="account-content">
          <div className="account-table-data">
            <Table columns={columns} dataSource={accountData} />
          </div>
        </div>
      </div>
    </div>
  );
};
