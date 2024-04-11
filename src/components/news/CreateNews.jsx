import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase-config";
import { PlusOutlined } from "@ant-design/icons";
// import { storage } from "firebase/app";
import {
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 } from "uuid";
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Modal,
  Input,
  InputNumber,
  Mentions,
  Select,
  notification,
  TreeSelect,
  Alert,
  Image,
  Upload,
} from "antd";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
const { RangePicker } = DatePicker;
const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
};
const CreateNews = ({ isvisible, setCreateForm, handleFCancel }) => {
  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const { TextArea } = Input;
  const options = [];

  const data = [
    "An Giang",
    "Ba Ria - Vung Tau",
    "Bac Giang",
    "Bac Kan",
    "Bac Lieu",
    "Bac Ninh",
    "Ben Tre",
    "Binh Duong",
    "Binh Phuoc",
    "Binh Thuan",
    "Binh Dinh",
    "Ca Mau",
    "Can Tho",
    "Cao Bang",
    "Gia Lai",
    "Ha Giang",
    "Ha Nam",
    "Ha Noi",
    "Ha Tinh",
    "Hai Duong",
    "Hai Phong",
    "Hau Giang",
    "Ho Chi Minh",
    "Hoa Binh",
    "Hung Yen",
    "Khanh Hoa",
    "Kien Giang",
    "Kon Tum",
    "Lai Chau",
    "Lam Dong",
    "Lang Son",
    "Lao Cai",
    "Long An",
    "Nam Dinh",
    "Nghe An",
    "Ninh Binh",
    "Ninh Thuan",
    "Phu Tho",
    "Phu Yen",
    "Quang Binh",
    "Quang Nam",
    "Quang Ngai",
    "Quang Ninh",
    "Quang Tri",
    "Soc Trang",
    "Son La",
    "Tay Ninh",
    "Thai Binh",
    "Thai Nguyen",
    "Thanh Hoa",
    "Thua Thien Hue",
    "Tien Giang",
    "Tra Vinh",
    "Tuyen Quang",
    "Vinh Long",
    "Vinh Phuc",
    "Yen Bai",
    "Da Nang",
    "Dak Lak",
    "Dak Nong",
    "Dien Bien",
    "Dong Nai",
    "Dong Thap",
  ];
  data.forEach((item) => {
    options.push({
      value: item,
      label: item,
    });
  });

  const handleChange = async ({ fileList: newFileList }) => {
    const processedFileList = await Promise.all(
      newFileList.map(async (file) => {
        const url = file.url || URL.createObjectURL(file.originFileObj);
        const response = await fetch(url);
        const blob = await response.blob();

        return {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: file.url || URL.createObjectURL(file.originFileObj),
          blob: blob, // Lưu dữ liệu thô của file
        };
      })
    );

    setFileList(processedFileList);
  };

  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Create News Information",
        description: "News has been created successfully!",
      },
      warning: {
        message: message || "Error: Create News Information Failed",
        description: "Please Try Again!",
      },
      error: {
        message: message || "Error: Create News Information Failed",
        description: "Please Try Again!",
      },
      // Thêm các loại thông báo khác ở đây nếu cần
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };

  const handleCancel = () => {
    setCreateForm(false);
    form.resetFields();
    setFileList([]);
  };
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
      .replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
      .toUpperCase(); // Viết hoá chuỗi UUID
  }

  function getCurrentDateTime() {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const currentDate = new Date();
    const dayOfWeek = days[currentDate.getDay()];
    const dayOfMonth = currentDate.getDate();
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");

    return `${dayOfWeek}, ${dayOfMonth}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  }
  const handleOk = async (value) => {
    const values = await form.validateFields();

    let postDoc;
    try {
      //chuyển ảnh về dạng blob của firebase rồi lưu lên storage
      const storageRef = ref(storage, `/createpost/${fileList[0].name}`);

      const is_approved = values.is_approved === "true";
      await uploadBytesResumable(storageRef, fileList[0].blob);
      const downloadURL = await getDownloadURL(storageRef);

      let id;
      let postSnapshot;

      do {
        // Tạo id ngẫu nhiên
        id = generateUUID();
        // Kiểm tra xem id đã tồn tại trong cơ sở dữ liệu chưa
        postDoc = doc(db, "createpost_info", "ICCREATORY-" + id);
        postSnapshot = await getDoc(postDoc);
      } while (postSnapshot.exists()); // Lặp lại nếu snapshot tồn tại
      const currentDateTime = getCurrentDateTime();
      //tạo đối tượng child để lưu
      const newData = {
        account_user: values.account_user,
        city_post: values.city_post,
        content_post: values.content_post,
        daycreate_post: currentDateTime,
        firstname_user: values.firstname_user,
        image_post: downloadURL,
        id_post: id,
        is_approved: is_approved,
      };

      //check email đã tồn tại không
      await setDoc(postDoc, newData);
      openNotificationWithIcon("success");
      setCreateForm(false);
    } catch (error) {
      openNotificationWithIcon("failed");
      throw error; // Ném ra lỗi nếu có lỗi xảy ra
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  return (
    <div>
      {contextHolder}
      <Modal
        title="Edit News Information"
        visible={isvisible}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              handleCancel();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form
                .validateFields() // Validate các trường trong form trước
                .then((values) => {
                  // Truyền các giá trị đã nhập từ form vào hàm handleOk
                  handleOk(values);
                })
                .catch((errorInfo) => {
                  console.log("Validation failed:", errorInfo);
                });
            }}
          >
            Submit
          </Button>,
        ]}
      >
        <Form
          {...formItemLayout}
          variant="filled"
          style={{
            maxWidth: 1000,
          }}
          initialValues={{}}
          form={form}
        >
          <Form.Item
            label="Account Create"
            name="account_user"
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "Please input your E-mail!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="firstname_user"
            rules={[
              {
                required: true,
                message: "Please input Creator First name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastname_user"
            rules={[
              {
                required: true,
                message: "Please input Creator Last name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="City"
            name="city_post"
            rules={[
              {
                required: true,
                message: "Please input!",
              },
            ]}
          >
            <Select
              size="middle"
              style={{
                width: 200,
              }}
              options={options}
            />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content_post"
            rules={[
              {
                required: true,
                message: "Please input!",
              },
            ]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Is Approved"
            name="is_approved"
            rules={[
              {
                required: true,
                message: "Please input!",
              },
            ]}
          >
            <Select placeholder="select account status">
              <Option value="true">True</Option>
              <Option value="false">False</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Post Image"
            name="image_post"
            rules={[
              {
                required: false,
                message: "Please select Post Image!",
              },
            ]}
          >
            <Upload
              // action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{
                  display: "none",
                }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(""),
                }}
                src={previewImage}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateNews;
