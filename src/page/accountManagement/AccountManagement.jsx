import React, { useState, useEffect } from "react";
import TabBar from "../../components/tabbar/TabBar";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import "./AccountManagement.css";
import { db } from "../../firebase-config";
// import { useState } from "react";
import {
  Space,
  Table,
  Tag,
  Input,
  Button,
  Spin,
  notification,
  Switch,
  Modal,
} from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import EditAccountForm from "../../components/account/EditAccountForm";
import CreateAccountForm from "../../components/account/CreateAccount";
const { confirm } = Modal;
const { Search } = Input;

// Design cho nút tìm kiếm

export const AccountManagement = () => {
  const [accountData, setAccountData] = useState([]);
  const [editForm, setEditForm] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [modal, contextHolder] = Modal.useModal();
  const [searchKey, setSearchKey] = useState("");
  var count = 0;
  useEffect(() => {
    if (searchKey === "") {
      fetchData();
    } else {
      onSearch(searchKey);
    }
    const intervalId = setInterval(() => {
      if (searchKey === "") {
        fetchData();
      } else {
        onSearch(searchKey);
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [searchKey]);

  const onSearch = async (value, _e, info) => {
    console.log("befo search " + searchKey);
    if (value === "") {
      setSearchKey("");
      return;
    }
    setSearchKey(value);
    setLoading(true);
    // console.log("after search key " + searchKey);
    const usersCollection = collection(db, "account_info");
    const q = query(
      usersCollection,
      where("firstname_user", "==", value) // firstname chứa keyword
    );
    const querySnapshot = await getDocs(q);
    // console.log(querySnapshot);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
      results.push({
        // id: account.id,
        email: doc.data().account_user,
        firstname: doc.data().firstname_user,
        lastname: doc.data().lastname_user,
        name: doc.data().firstname_user + " " + doc.data().lastname_user,
        ccc: doc.data().childadoptioncode_children,
        phone: doc.data().phone_user,
        role: doc.data().role_user,
        codebill_payment: doc.data().codebill_payment,
        province: doc.data().province_user,
        status: doc.data().banned_user ? "true" : "false",
      });
      setAccountData(results);
      setLoading(false);
    });
  };

  const [api, contextHolder2] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Delete Account Success",
        description: "Account has been deleted successfully!",
      },
      error: {
        message: message || "Error: Delete Account Failed",
        description: "This email already exists!",
      },
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };

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
          <Button onClick={() => deleteUser(record)} type="primary" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const paginationConfig = {
    pageSize: 5,
    total: accountData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    onChange: (page, pageSize) => {
      // Xử lý khi thay đổi trang
      console.log("Current page:", page);
      console.log("Page size:", pageSize);
    },
  };
  const handleEditClick = (record) => {
    setEditForm(true);
    setSelectedRecord(record);
  };
  const handleCreateClick = () => {
    setCreateForm(true);
  };

  const deleteUser = async (value) => {
    confirm({
      title: "Are you sure you want to delete this item?",
      icon: <ExclamationCircleOutlined />,
      content: "You won't be able to revert this",
      okText: "Yes",
      cancelText: "Cancel",
      async onOk() {
        try {
          const userDocRef = doc(
            db,
            "account_info",
            "ICCREATORY-" + value.email
          );
          // Xóa tài liệu
          await deleteDoc(userDocRef);
          openNotificationWithIcon("success");
        } catch (error) {
          openNotificationWithIcon("error");
        }
      },
      onCancel() {},
    });
  };

  //Lấy dữ liệu từ collection firebase
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "account_info"));

      const res = [];
      querySnapshot.forEach((account) => {
        console.log(account.data());
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
          codebill_payment: account.data().codebill_payment,
          role: account.data().role_user,
          province: account.data().province_user,
          status: account.data().banned_user ? "true" : "false",
        });
      });
      setAccountData(res);
    } catch (error) {
    } finally {
      setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
    }
  };
  //
  // fetchData();
  const [activeTab, setActiveTab] = useState("Account Management");
  return (
    <div className="account-container">
      {contextHolder}
      {contextHolder2}
      <EditAccountForm
        isvisible={editForm}
        setEditForm={setEditForm}
        accountSelect={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        handleFCancel={() => {
          setSelectedRecord(null);
        }}
      />
      <CreateAccountForm
        isvisible={createForm}
        setCreateForm={setCreateForm}
        // handleFCancel={() => {
        //   setSelectedRecord(null);
        // }}
      />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="account-body">
        <div className="account-header-gr">
          <h1 className="account-header">Account Management</h1>
          <Space direction="vertical" className="account-input">
            <Search
              className="input-search"
              placeholder="Enter name or email..."
              onSearch={onSearch}
              enterButton
              style={{
                width: 300,
                height: 100,
              }}
            />
          </Space>
        </div>
        <button className="add-account-btn" onClick={handleCreateClick}>
          <PlusOutlined />
          Add Account
        </button>
        <div className="account-content">
          <div className="account-table-data">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={accountData}
                pagination={paginationConfig}
                style={{}}
              />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};
