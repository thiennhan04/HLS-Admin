import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";
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
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
const { RangePicker } = DatePicker;
const { Option } = Select;
dayjs.extend(customParseFormat);
const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY", "DD-MM-YYYY", "DD-MM-YY"];
const dateFormat = "DD/MM/YYYY";
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
const EditChild = ({
  isvisible,
  setEditForm,
  childSelect,
  setSelectedRecord,
  handleFCancel,
  childBirthDate,
  setChildBirthDate,
}) => {
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState();
  const [fileList, setFileList] = useState([]);
  const [isChangeAvt, setIsChangeAvt] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const [key, setKey] = useState(0); // Add key state

  useEffect(() => {
    setKey(key + 1); // Update key whenever childBirthDate changes
  }, [childBirthDate]);

  useEffect(() => {
    if (childSelect) {
      // console.log(childBirthDate + " " + childSelect.dateofbirth_children);
      form.setFieldsValue(childSelect);
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: childSelect.avatar_children,
        },
      ]);
    }
  }, [childSelect, form]);

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

  const handleChange = async ({ fileList: newFileList }) => {
    setIsChangeAvt(true);
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
  const handleCancel = () => {
    setEditForm(false);
    setChildBirthDate("");
    setSelectedRecord(null);
    handleFCancel();
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      error: {
        message: message || "Error: Update Child Info Failed",
        description: "Please try again!",
      },
      success: {
        message: message || "Success: Update Information Success",
        description: "Information has been Updated successfully!",
      },
      warning: {
        message: message || "Warning: Update Child Information Failed",
        description: "Please try again!",
      },
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };
  const handleOk = async (child) => {
    const values = await form.validateFields();
    //lấy dữ liệu từ account từ firebase
    const childDoc = doc(
      db,
      "child_info",
      "ICCREATORY-" + childSelect.childadoptioncode_children
    );
    console.log(childBirthDate);
    const selectedDate = new Date(childBirthDate);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    console.log(day);
    // Biến đổi thành chuỗi định dạng "YYYY-MM-DD"
    const formattedDate = `${month}/${day}/${year}`;
    console.log(formattedDate);
    try {
      await updateDoc(childDoc, {
        // avatar_children: child.data().avatar_children,
        address_children: child.address_children,
        fullname_children: child.fullname_children,
        dateofbirth_children: formattedDate,
        gender_children: child.gender_children,
        old_children: child.old_children,
        province_children: child.province_children,
      });
      openNotificationWithIcon("success");
      setEditForm(false);
      setSelectedRecord(null);
    } catch (e) {
      openNotificationWithIcon("error");
      console.log(e.message);
    }
  };
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
        title="Edit Children Information"
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
          initialValues={childSelect || {}}
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
            name=""
            rules={[
              {
                required: false,
                message: "Please select Date Of Birth!",
              },
            ]}
          >
            <DatePicker
              key={key}
              defaultValue={dayjs(childBirthDate, dateFormat)}
              // value={dayjs(childBirthDate, dateFormat)}
              format={dateFormatList[0]}
              onChange={(date) => setChildBirthDate(date)}
            />
          </Form.Item>

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

export default EditChild;
