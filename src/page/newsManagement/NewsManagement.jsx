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
import CreateNews from "../../components/news/CreateNews";
import Fuse from "fuse.js";
const { confirm } = Modal;
const { Search } = Input;

const NewsManagement = () => {
  const [postsData, setpostsData] = useState([]);
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
    }, 5000);
    return () => clearInterval(intervalId);
  }, [searchKey]);

  const onSearch = async (searchKey) => {
    // console.log(info?.source, value);
    if (searchKey === "") {
      setSearchKey("");
      return;
    }
    setSearchKey(searchKey);
    try {
      const snapshot = await getDocs(collection(db, "createpost_info"));
      const data = snapshot.docs.map((doc) => doc.data());
      const contents = data.map((item) => item.content_post);
      const fuse = new Fuse(data, {
        keys: ["content_post"],
        threshold: 0.3,
      });
      const searchResults = fuse.search(searchKey);
      const res = [];
      searchResults.forEach((post) => {
        res.push(post.item);
      });
      setpostsData(res);
    } catch (e) {
      openNotificationWithIcon("warning");
      console.log(e.message);
    }
    setLoading(false);
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
      warning: {
        message: message || "Error: Search Post Information Failed",
        description: "Please Try Again!",
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
          <Button onClick={() => deletePost(record)} type="primary" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const paginationConfig = {
    pageSize: 3,
    total: postsData.length,
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

  const deletePost = async (value) => {
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
            "createpost_info",
            "ICCREATORY-" + value.id_post
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
      setpostsData(res);
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
      <CreateNews
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
              placeholder="Enter post content..."
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
                dataSource={postsData}
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
