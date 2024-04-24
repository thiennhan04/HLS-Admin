import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
import "../accountManagement/AccountManagement.css";
import "./CalendarManagement.css";
import { db, auth } from "../../firebase-config";
// import { useState } from "react";
import {
  Space,
  Table,
  Tag,
  Input,
  Button,
  Spin,
  Dropdown,
  notification,
  Switch,
  Modal,
  Menu,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import EditAccountForm from "../../components/account/EditAccountForm";
import CreateCalendarForm from "../../components/calendar/CreateCalendar";
const { confirm } = Modal;
const { Search } = Input;

const CalendarManagement = () => {
  const [calendarData, setcalendarData] = useState([]);
  const [editForm, setEditForm] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [modal, contextHolder] = Modal.useModal();
  const [searchKey, setSearchKey] = useState("");
  const navigate = useNavigate();
  var countAuth = 0;
  var items = [];
  const [activeTab, setActiveTab] = useState("Calendar Management");
  const checkUserAuth = () => {
    const user = auth.currentUser;
    setLoading(true);
    if (user) {
      // Người dùng đã đăng nhập
      console.log("User is logged in:");
    } else {
      navigate("/");
    }
    setLoading(false);
  };
  useEffect(() => {
    if (countAuth === 0) checkUserAuth();
    countAuth++;
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
  const [api, contextHolder2] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Delete Calendar Success",
        description: "Calendar has been deleted successfully!",
      },
      error: {
        message: message || "Error: Delete Calendar Failed",
        description: "",
      },
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };

  const columns = [
    {
      title: "Calendar Title",
      dataIndex: "title_calendar",
      key: "title_calendar",
    },
    {
      title: "Detail Province",
      dataIndex: "detailprovince_calendar",
      key: "detailprovince_calendar",
    },
    {
      title: "Max members ",
      dataIndex: "maximummembers_calendar",
      key: "maximummembers_calendar",
    },
    {
      title: "Members Join ",
      dataIndex: "membersjoin_calendar",
      render: (_, record) => {
        const membersjoin_calendar = record.membersjoin_calendar;
        const menu = (
          <Menu>
            {membersjoin_calendar.map((item, index) => (
              <Menu.Item key={index}>{item}</Menu.Item>
            ))}
          </Menu>
        );
        return (
          <Space size="middle">
            <Dropdown overlay={menu}>
              <Button>
                <Space>
                  {membersjoin_calendar.length} People
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
    {
      title: "Volunteer Leader",
      dataIndex: "volunteer_calendar",
      key: "volunteer_calendar",
    },
    {
      title: "Date",
      dataIndex: "date_calendar",
      key: "date_calendar",
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
    total: calendarData.length,
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
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "calendar_info"));

      const res = [];
      querySnapshot.forEach((calendar) => {
        calendar.data().membersjoin_calendar.forEach((member) => {
          items.push(member);
        });

        res.push({
          // key: count,
          content_calendar: calendar.content_calendar,
          date_calendar: calendar.data().date_calendar,
          detailprovince_calendar: calendar.data().detailprovince_calendar,
          lastname: calendar.data().lastname_user,
          id_calendar: calendar.data().id_calendar,
          maximummembers_calendar: calendar.data().maximummembers_calendar,
          membersjoin_calendar: calendar.data().membersjoin_calendar,
          timerend_calendar: calendar.data().timerend_calendar,
          timerstart_calendar: calendar.data().timerstart_calendar,
          title_calendar: calendar.data().title_calendar,
          volunteer_calendar: calendar.data().volunteer_calendar,
        });
      });
      setcalendarData(res);
    } catch (error) {
    } finally {
      setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
    }
  };
  const onSearch = async (value, _e, info) => {
    if (value === "") {
      setSearchKey("");
      return;
    }
    setSearchKey(value);
    setLoading(true);
    const usersCollection = collection(db, "account_info");
    const q = query(
      usersCollection,
      where("firstname_user", "==", value) // firstname chứa keyword
    );
    const querySnapshot = await getDocs(q);
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
      setcalendarData(results);
      setLoading(false);
    });
  };
  return (
    <div className="calendar-container">
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
      <CreateCalendarForm
        isvisible={createForm}
        setCreateForm={setCreateForm}
        // handleFCancel={() => {
        //   setSelectedRecord(null);
        // }}
      />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="calendar-body">
        <div className="account-header-gr">
          <h1 className="account-header">Calendar Management</h1>
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
        <div class="add-calendar-gr">
          <button className="add-calendar-btn " onClick={handleCreateClick}>
            <PlusOutlined />
            Add Account
          </button>
        </div>
        <div className="account-content">
          <div className="account-table-data">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={calendarData}
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

export default CalendarManagement;