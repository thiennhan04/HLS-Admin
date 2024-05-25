import React, { useState, useEffect } from "react";
import TabBar from "../../components/tabbar/TabBar";
import { db, auth } from "../../firebase-config";
import "../billManagement/BillManagement.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
  Space,
  Table,
  Tag,
  Input,
  Button,
  Switch,
  Spin,
  notification,
  Image,
  Modal,
  Select,
} from "antd";

const { confirm } = Modal;
const { Search } = Input;

const VolunteerParticipation = () => {
  const [billData, setBillData] = useState([]);
  const [activeTab, setActiveTab] = useState("Volunteer Participation");
  const [loading, setLoading] = React.useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [filterStatus, setFilterStatus] = useState("register");
  const navigate = useNavigate();
  const { Option } = Select;
  var countAuth = 0;

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
    }, 5000);
    return () => clearInterval(intervalId);
  }, [searchKey, filterStatus]);
  const onSearch = async (searchKey) => {
    if (searchKey === "") {
      await setSearchKey("");
      return;
    }
    setLoading(true);
    const q = await query(
      collection(
        db,
        filterStatus === "register"
          ? "registervolunteer_info"
          : "cancelregistervolunteer_info"
      ),
      where(
        filterStatus === "register"
          ? "account_registervolunteer"
          : "account_cancelregistervolunteer",
        "==",
        searchKey
      )
      // Thêm một điều kiện mới, ví dụ: tuổi lớn hơn hoặc bằng 18
    );
    const querySnapshot = await getDocs(q);
    const res = [];
    querySnapshot.forEach((volunteer) => {
      res.push({
        content:
          filterStatus === "register"
            ? volunteer.data().content_registervolunteer
            : volunteer.data().content_cancelregistervolunteer,
        email:
          filterStatus === "register"
            ? volunteer.data().account_registervolunteer
            : volunteer.data().account_cancelregistervolunteer,
        id:
          filterStatus === "register"
            ? volunteer.data().id_registervolunteer
            : volunteer.data().id_cancelregistervolunteer,
        fullname:
          filterStatus === "register"
            ? volunteer.data().firstname_registervolunteer +
              volunteer.data().lastname_registervolunteer
            : volunteer.data().firstname_cancelregistervolunteer +
              " " +
              volunteer.data().lastname_cancelregistervolunteer,
        phone:
          filterStatus === "register"
            ? volunteer.data().phonenumber_registervolunteer
            : volunteer.data().phonenumber_cancelregistervolunteer,
        province:
          filterStatus === "register"
            ? volunteer.data().province_registervolunteer
            : volunteer.data().province_cancelregistervolunteer,
        status: (
          filterStatus === "register"
            ? volunteer.data().status_registervolunteer
            : volunteer.data().status_cancelregistervolunteer
        )
          ? "true"
          : "false",
      });
    });
    setBillData(res);
    setSearchKey(searchKey);
    setLoading(false);
  };
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(
          db,
          filterStatus === "register"
            ? "registervolunteer_info"
            : "cancelregistervolunteer_info"
        )
      );
      const res = [];
      querySnapshot.forEach((volunteer) => {
        res.push({
          content:
            filterStatus === "register"
              ? volunteer.data().content_registervolunteer
              : volunteer.data().content_cancelregistervolunteer,
          email:
            filterStatus === "register"
              ? volunteer.data().account_registervolunteer
              : volunteer.data().account_cancelregistervolunteer,
          id:
            filterStatus === "register"
              ? volunteer.data().id_registervolunteer
              : volunteer.data().id_cancelregistervolunteer,
          fullname:
            filterStatus === "register"
              ? volunteer.data().firstname_registervolunteer +
                volunteer.data().lastname_registervolunteer
              : volunteer.data().firstname_cancelregistervolunteer +
                " " +
                volunteer.data().lastname_cancelregistervolunteer,
          phone:
            filterStatus === "register"
              ? volunteer.data().phonenumber_registervolunteer
              : volunteer.data().phonenumber_cancelregistervolunteer,
          province:
            filterStatus === "register"
              ? volunteer.data().province_registervolunteer
              : volunteer.data().province_cancelregistervolunteer,
          status: (
            filterStatus === "register"
              ? volunteer.data().status_registervolunteer
              : volunteer.data().status_cancelregistervolunteer
          )
            ? "true"
            : "false",
        });
      });

      // Sắp xếp kết quả theo trường statusbill_payment (false trước, true sau)
      res.sort((a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1));
      setBillData(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Accept Form Success",
        description: "Children have been added to the user!",
      },
      error: {
        message: message || "Error: Accept Form Failed",
        description: "Please Try Again!",
      },
      // warning: {
      //   message: message || "Warning: Accept Form Failed",
      //   description:
      //     "There are currently no available children in this province, please try again later!",
      // },
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };
  const handleAcceptForm = async (record) => {
    confirm({
      title: "Do you want to accept this request form?",
      icon: <ExclamationCircleOutlined />,
      content: "You won't be able to revert this",
      okText: "Yes",
      cancelText: "Cancel",
      async onOk() {
        try {
          const formDoc = doc(
            db,
            filterStatus === "register"
              ? "registervolunteer_info"
              : "cancelregistervolunteer_info",
            "ICCREATORY-" + record.id
          );
          const accountDoc = doc(
            db,
            "account_info",
            "ICCREATORY-" + record.email
          );

          const accountSnap = await getDoc(accountDoc);
          const formSnap = await getDoc(formDoc);

          await updateDoc(
            formDoc,
            filterStatus === "register"
              ? {
                  status_registervolunteer: record.status !== "true",
                }
              : {
                  status_cancelregistervolunteer: record.status !== "true",
                }
          );

          // //set mã nhận nuôi cho người nhận
          var newChildAdopCode = "";
          if (accountSnap.data().childadoptioncode_children) {
          } else {
            // newChildAdopCode = firstChildDoc.data().childadoptioncode_children;
          }
          await updateDoc(
            accountDoc,
            filterStatus === "register"
              ? {
                  role_user: "volunteer",
                }
              : {
                  role_user: "user",
                }
          );
        } catch (err) {
          await openNotificationWithIcon("error");
        }
      },
      onCancel() {},
    });
  };
  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Account Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (text) => {
        const words = text.split(" ");
        const displayText = words.slice(0, 6).join(" ");
        const extraText = words.length > 15 ? "..." : "";
        return (
          <div>
            {displayText}
            {extraText}
          </div>
        );
      },
    },
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "province_registervolunteer",
      dataIndex: "province",
      key: "province",
    },

    {
      title: "Status ",
      key: "status",
      render: (_, record) => (
        <Space size="middle">
          <Switch
            disabled={record.status === "true"}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            value={record.status === "true"}
            onChange={(checked) => handleAcceptForm(record)}
          />
        </Space>
      ),
    },
  ];
  const paginationConfig = {
    pageSize: 3,
    total: billData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    onChange: (page, pageSize) => {},
  };
  const handleSelectChange = (value) => {
    setFilterStatus(value);
  };
  return (
    <div className="bill-container">
      {contextHolder}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="bill-body">
        <div className="bill-header-gr">
          <h1 className="bill-header">Volunteer Participation</h1>
          <Space direction="vertical" className="account-input">
            <Search
              className="input-search"
              placeholder="Enter account email..."
              onSearch={onSearch}
              enterButton
              style={{
                width: 300,
                height: 100,
              }}
            />
          </Space>
        </div>
        <div className="bill-header-gr">
          <Select
            placeholder="select account status"
            defaultValue="register"
            onChange={handleSelectChange}
          >
            <Option value="register">Register Volunteer</Option>
            <Option value="cancel">Cancel Volunteer</Option>
          </Select>
        </div>
        <div className="bill-content">
          <div className="bill-table-data">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={billData}
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

export default VolunteerParticipation;
