import React, { useState, useEffect } from "react";
import "./ChildManagement.css";
import TabBar from "../../components/tabbar/TabBar";
import { db, auth } from "../../firebase-config";
import EditChild from "../../components/child/EditChild";
import { useHistory } from "react-router-dom";
import { Routes, Route, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
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
  Upload,
} from "antd";
import CreateChild from "../../components/child/CreateChild";
const { confirm } = Modal;
const { Search } = Input;
const ChildManagement = () => {
  const [activeTab, setActiveTab] = useState("Child Management");
  const [childData, setChildData] = useState([]);
  const [editForm, setEditForm] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [modal, contextHolder] = Modal.useModal();
  const [searchKey, setSearchKey] = useState("");
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  var countSearch = 0;
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
    }, 10000);
    return () => clearInterval(intervalId);
  }, [searchKey]);
  // useEffect(() => {
  //   fetchData();
  //   const intervalId = setInterval(() => {
  //     if (searchKey === "") {
  //       fetchData();
  //     } else {
  //       // onSearch(searchKey);
  //     }
  //   }, 4000);
  //   return () => clearInterval(intervalId);
  // }, [searchKey]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "child_info"));
      const res = [];
      querySnapshot.forEach((child) => {
        res.push({
          avatar_children: child.data().avatar_children,
          address_children: child.data().address_children,
          childadoptioncode_children: child.data().childadoptioncode_children,
          fullname_children: child.data().fullname_children,
          dateofbirth_children: child.data().dateofbirth_children,
          gender_children: child.data().gender_children,
          old_children: child.data().old_children,
          province_children: child.data().province_children,
          isadop_children: child.data().isadop_children ? "true" : "false",
        });
      });
      setChildData(res);
    } catch (error) {
    } finally {
      setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
    }
  };

  const [api, contextHolder2] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Delete Account Success",
        description: "Children has been deleted successfully!",
      },
      error: {
        message: message || "Error: Delete Account Failed",
        description: "Please Try Again!",
      },
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };

  const onSearch = async (searchKey) => {
    setSearchKey(searchKey);

    if (searchKey === "") {
      await setSearchKey("");
      countSearch = 0;
      return;
    }

    setLoading(true);

    // Lấy dữ liệu từ Firestore
    const snapshot = await getDocs(collection(db, "child_info"));
    const data = snapshot.docs.map((doc) => doc.data());
    // Tạo một danh sách các tên
    const names = data.map((item) => item.fullname_children);
    // Tạo một đối tượng Fuse với toàn bộ dữ liệu
    const fuse = new Fuse(data, {
      keys: ["fullname_children"],
      threshold: 0.3,
    });
    // Tìm kiếm các kết quả gần đúng
    const searchResults = fuse.search(searchKey);
    const res = [];
    searchResults.forEach((bill) => {
      res.push(bill.item);
    });
    setChildData(res);
    // setTimeout(() => {
    //   setLoading(false); // Đặt loading thành false sau 2 giây
    // }, 1000);
    setLoading(false);
  };
  const handleEditClick = (record) => {
    setEditForm(true);
    setSelectedRecord(record);
    setDate(record.dateofbirth_children);
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
          if (value.childadopter_children !== "") {
            try {
              const accountDoc = doc(
                db,
                "account_info",
                "ICCREATORY-" + value.childadopter_children
              );
              if (accountDoc) {
                confirm({
                  title: "Are you sure you want to delete this item?",
                  icon: <ExclamationCircleOutlined />,
                  content: "Children are being adopted by an account",
                  okText: "Yes",
                  cancelText: "Cancel",
                  async onOk() {
                    try {
                      const userDocRef = doc(
                        db,
                        "child_info",
                        "ICCREATORY-" + value.childadoptioncode_children
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
              }
              await deleteDoc(accountDoc);
            } catch (error) {
              openNotificationWithIcon("error");
              return;
            }
          }
          // Xóa tài liệu

          openNotificationWithIcon("success");
        } catch (error) {
          openNotificationWithIcon("error");
        }
      },
      onCancel() {},
    });
  };
  const columns = [
    {
      title: " Child Image",
      dataIndex: "avatar_children",
      render: (_, record) => (
        <Image.PreviewGroup items={[`${record.avatar_children}`]}>
          <Image height={100} width={70} src={`${record.avatar_children}`} />
        </Image.PreviewGroup>
      ),
    },
    {
      title: "Child Code",
      dataIndex: "childadoptioncode_children",
      key: "childadoptioncode_children",
    },
    {
      title: "Full Name",
      dataIndex: "fullname_children",
      key: "fullname_children",
    },
    {
      title: "Date Of Birth",
      dataIndex: "dateofbirth_children",
      key: "dateofbirth_children",
    },
    {
      title: "Gender",
      dataIndex: "gender_children",
      key: "gender_children",
    },
    {
      title: "Age",
      dataIndex: "old_children",
      key: "old_children",
    },
    {
      title: "Province",
      dataIndex: "province_children",
      key: "province_children",
    },

    {
      title: "Address",
      dataIndex: "address_children",
      key: "address_children",
    },
    {
      title: "Status",
      key: "isadop_children",
      dataIndex: "isadop_children",
      render: (_, tag) => {
        let statusText =
          tag.isadop_children === "true" ? "Adopted" : "Not Adopted";
        let color = tag.isadop_children === "true" ? "green" : "volcano";

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
  const handleCreateClick = () => {
    setCreateForm(true);
  };
  const paginationConfig = {
    pageSize: 3,
    total: childData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    onChange: (page, pageSize) => {
      // Xử lý khi thay đổi trang
      console.log("Current page:", page);
      console.log("Page size:", pageSize);
    },
  };
  return (
    <div className="child-container">
      <CreateChild
        isvisible={createForm}
        setCreateForm={setCreateForm}
        // handleFCancel={() => {
        //   setSelectedRecord(null);
        // }}
      />
      <EditChild
        isvisible={editForm}
        setEditForm={setEditForm}
        childSelect={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        childBirthDate={date}
        setChildBirthDate={setDate}
        handleFCancel={() => {
          setSelectedRecord(null);
        }}
      />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="child-body">
        <div className="account-header-gr">
          <h1 className="account-header">Children Management</h1>
          <Space direction="vertical" className="account-input">
            <Search
              className="input-search"
              placeholder="Enter children name..."
              onSearch={onSearch}
              enterButton
              style={{
                width: 300,
                height: 100,
              }}
            />
          </Space>
        </div>
        <div className="add-child-gr">
          <button className="add-child-btn" onClick={handleCreateClick}>
            <PlusOutlined className="add-icon" />
            Add Children Info
          </button>
        </div>
        <div className="child-content">
          <div className="account-table-data">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={childData}
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

export default ChildManagement;
