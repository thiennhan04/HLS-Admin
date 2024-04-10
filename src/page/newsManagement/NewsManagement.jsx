import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
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
import { db } from "../../firebase-config";
// import { useState } from "react";
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
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import CreateAccountForm from "../../components/account/CreateAccount";
import EditNews from "../../components/news/EditNews";
const { confirm } = Modal;
const { Search } = Input;

const NewsManagement = () => {
  const [accountData, setAccountData] = useState([]);
  const [editForm, setEditForm] = useState(false);
  const [createForm, setCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = React.useState(true);
  const [modal, contextHolder] = Modal.useModal();
  const [searchKey, setSearchKey] = useState("");

  var count = 0;
  useEffect(() => {
    fetchData();
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
    // console.log(info?.source, value);
    if (value === "") {
      setSearchKey("");
      return;
    }
    setSearchKey(value);
    const usersCollection = collection(db, "account_info");
    const q = query(
      usersCollection,
      where("firstname_user", ">=", value) // firstname chứa keyword
    );
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({
        // id: account.id,
        email: doc.data().account_user,
        firstname: doc.data().firstname_user,
        lastname: doc.data().lastname_user,
        name: doc.data().firstname_user + " " + doc.data().lastname_user,
        ccc: doc.data().childadoptioncode_children,
        phone: doc.data().phone_user,
        role: doc.data().role_user,
        province: doc.data().province_user,
        status: doc.data().banned_user ? "true" : "false",
      });
      // console.log("ket qua tim kiem " + doc);
      setAccountData(results);
    });
  };

  const [api, contextHolder2] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Delete Post Success",
        description: "Post has been deleted successfully!",
      },
      error: {
        message: message || "Error: Delete Post Failed",
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
      title: "Id Post",
      dataIndex: "id_post",
      key: "id_post",
    },
    {
      title: "Image Post",
      dataIndex: "image_post",
      render: (_, record) => (
        <Image.PreviewGroup items={[`${record.image_post}`]}>
          <Image height={70} width={100} src={`${record.image_post}`} />
        </Image.PreviewGroup>
      ),
    },
    {
      title: "Post Content",
      dataIndex: "content_post",
      key: "content_post",
      render: (text) => {
        const words = text.split(" ");
        const displayText = words.slice(0, 6).join(" ");
        const extraText = words.length > 10 ? "..." : "";
        return (
          <div>
            {displayText}
            {extraText}
          </div>
        );
      },
    },
    {
      title: "Creator Email",
      dataIndex: "account_user",
      key: "account_user",
    },
    {
      title: "Creator Name",
      dataIndex: "fullname_user",
      key: "firstname_user",
    },
    {
      title: "Create At",
      dataIndex: "daycreate_post",
      key: "daycreate_post",
    },
    {
      title: "City Post",
      dataIndex: "city_post",
      key: "city_post",
    },
    {
      title: "Status",
      key: "is_approved",
      dataIndex: "is_approved",
      render: (_, tag) => {
        let statusText =
          tag.is_approved !== "true" ? "Not Approved" : "Approved";
        let color = tag.is_approved !== "true" ? "volcano" : "green";

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
      const querySnapshot = await getDocs(collection(db, "createpost_info"));
      // console.log(querySnapshot);
      const res = [];
      querySnapshot.forEach((post) => {
        res.push({
          id_post: post.data().id_post,
          content_post: post.data().content_post,
          image_post: post.data().image_post,
          firstname_user: post.data().firstname_user,
          lastname_user: post.data().lastname_user,
          fullname_user:
            post.data().firstname_user + " " + post.data().lastname_user,
          daycreate_post: post.data().daycreate_post,
          daycreate_post_sort: dayjs(
            post.data().daycreate_post,
            "ddd, DD/MM/YYYY, HH:mm:ss"
          ).toDate(),
          account_user: post.data().account_user,
          city_post: post.data().city_post,
          is_approved: post.data().is_approved ? "true" : "false",
        });
      });
      // Sắp xếp kết quả theo trường daycreate_post
      res.sort((a, b) => b.daycreate_post_sort - a.daycreate_post_sort);
      setAccountData(res);
    } catch (error) {
    } finally {
      setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
    }
  };
  const [activeTab, setActiveTab] = useState("News Management");
  return (
    <div className="account-container">
      {contextHolder}
      {contextHolder2}
      <EditNews
        isvisible={editForm}
        setEditForm={setEditForm}
        postSelect={selectedRecord}
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
          <h1 className="account-header">News Management</h1>
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
          Add News
        </button>
        <div className="account-content">
          <div className="account-table-data">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={accountData}
                pagination={paginationConfig}
              />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsManagement;
