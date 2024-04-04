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

const CreateChild = ({ isvisible, setCreateForm, handleFCancel }) => {
  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
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
        message: message || "Success: Create Children Information",
        description: "Child has been created successfully!",
      },
      warning: {
        message: message || "Error: Create Children Information Failed",
        description: "Please Try Again!",
      },
      error: {
        message: message || "Error: Create Children Information Failed",
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
  };

  const handleOk = async (value) => {
    const values = await form.validateFields();

    let userDoc;
    try {
      //chuyển ảnh về dạng blob của firebase rồi lưu lên storage
      const storageRef = ref(storage, `/files/${fileList[0].name}`);
      console.log(fileList[0].url);
      await uploadBytesResumable(storageRef, fileList[0].blob);
      const downloadURL = await getDownloadURL(storageRef);

      let id;
      let userSnapshot;

      do {
        // Tạo id ngẫu nhiên
        const randomNumber = Math.floor(Math.random() * 999) + 1;
        id = "NE" + randomNumber.toString();

        // Kiểm tra xem id đã tồn tại trong cơ sở dữ liệu chưa
        userDoc = doc(db, "child_info", "ICCREATORY-" + id);
        userSnapshot = await getDoc(userDoc);
      } while (userSnapshot.exists()); // Lặp lại nếu snapshot tồn tại

      //chuyển đổi ngày giờ về đúng định dạng
      const selectedDate = new Date(values.dateofbirth_children);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      // Biến đổi thành chuỗi định dạng "YYYY-MM-DD"
      const formattedDate = `${day}-${month}-${year}`;

      //tạo đối tượng child để lưu
      const newData = {
        address_children: values.address_children,
        avatar_children: downloadURL,
        childadopter_children: "",
        childadoptioncode_children: id,
        dateofbirth_children: formattedDate,
        fullname_children: values.fullname_children,
        province_children: values.province_children,
        old_children: values.old_children,
        gender_children: values.gender_children,
        id_children: "ICCREATORY-" + id,
        isadop_children: false,
      };

      //check email đã tồn tại không
      // const userDoc = doc(db, "child_info", "ICCREATORY-" + "NE10");
      await setDoc(userDoc, newData);
      openNotificationWithIcon("success");
      setCreateForm(false);
      // const userSnapshot = await getDoc(userDoc);
      // if (userSnapshot.exists()) {
      //   openNotificationWithIcon("error");
      // } else {
      //   // Thêm dữ liệu vào collection "account_info"
      //   // const userDoc = doc(db, "account_info", "ICCREATORY-" + values.email);
      //   // const docRef = await addDoc(collection(db, "account_info"), newData);
      //   await setDoc(userDoc, newData);
      //   openNotificationWithIcon("success");
      //   setCreateForm(false);
      // }
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
  const validateNumber = (rule, value, callback) => {
    const onlyNumbersRegex = /^[0-9]+$/; // Biểu thức chính quy chỉ cho phép các số

    if (!value || onlyNumbersRegex.test(value)) {
      // Nếu giá trị rỗng hoặc là số, trả về undefined (không có lỗi)
      callback();
    } else {
      // Nếu không phải là số, trả về thông báo lỗi
      callback("Please input a valid Year Old!");
    }
  };
  return (
    <div>
      {contextHolder}
      <Modal
        title="Create New Children "
        visible={isvisible}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
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
            label="Children Name"
            name="fullname_children"
            rules={[
              {
                required: true,
                message: "Please input Children Name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            label="Adoption Code"
            name="childadoptioncode_children"
            rules={[
              {
                required: true,
                message: "Please input Adoption Code!",
              },
            ]}
          >
            <Input />
          </Form.Item> */}

          {/* <Form.Item
            label="Adopter"
            name="childadopter_children"
            rules={[
              {
                required: true,
                message: "Please input Adopter email!",
              },
            ]}
          >
            <Input />
          </Form.Item> */}

          <Form.Item
            label="Gender"
            name="gender_children"
            rules={[
              {
                required: true,
                message: "Please select Gender!",
              },
            ]}
          >
            <Select placeholder="select gender">
              <Option value="Male">Male</Option>
              <Option value="Famale">Famale</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Year Old"
            name="old_children"
            rules={[
              {
                required: true,
                message: "Please input year old!",
              },
              {
                validator: validateNumber, // Sử dụng hàm validator để kiểm tra giá trị
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Province"
            name="province_children"
            rules={[
              {
                required: true,
                message: "Please select Province!",
              },
            ]}
          >
            <Select
              size="middle"
              // defaultValue={}
              // onChange={handleChange}
              style={{
                width: 200,
              }}
              options={options}
            />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address_children"
            rules={[
              {
                required: true,
                message: "Please input Address!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Date Of Birth"
            name="dateofbirth_children"
            rules={[
              {
                required: true,
                message: "Please select Date Of Birth!",
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          {/* <Form.Item
            label="Banned Account"
            name="status"
            rules={[
              {
                required: true,
                message: "Please select Status!",
              },
            ]}
          >
            <Select placeholder="select account status">
              <Option value="true">True</Option>
              <Option value="false">False</Option>
            </Select>
          </Form.Item> */}
          <Form.Item
            label="Child Avatar"
            name="avatar_children"
            rules={[
              {
                required: false,
                message: "Please select child Image!",
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

export default CreateChild;
