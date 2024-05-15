import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase-config";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
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
  Select,
  notification,
  TimePicker,
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

const CreateCalendar = ({ isvisible, setCreateForm, handleFCancel }) => {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const options = [];
  const format = "HH:mm";
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("17:00");
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
        message: message || "Success: Create Visitation Information",
        description: "Visitation has been created successfully!",
      },
      warning: {
        message: message || "Error: Create Visitation Information Failed",
        description: "Please Try Again!",
      },
      error: {
        message: message || "Error: Create Visitation Information Failed",
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
  const handleOk = async (value) => {
    const values = await form.validateFields();

    let userDoc;
    try {
      let id;
      let userSnapshot;

      do {
        // Tạo id ngẫu nhiên
        const randomNumber = Math.floor(Math.random() * 999) + 1;
        id = generateUUID();
        // Kiểm tra xem id đã tồn tại trong cơ sở dữ liệu chưa
        userDoc = doc(db, "calendar_info", "ICCREATORY-" + id);
        userSnapshot = await getDoc(userDoc);
      } while (userSnapshot.exists()); // Lặp lại nếu snapshot tồn tại

      //chuyển đổi ngày giờ về đúng định dạng
      const selectedDate = new Date(values.date_calendar);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      // Biến đổi thành chuỗi định dạng "YYYY-MM-DD"
      const formattedDate = `${day}/${month}/${year}`;
      //tạo đối tượng child để lưu
      const newData = {
        volunteer_calendar: values.volunteer_calendar,
        timerstart_calendar: startTime,
        timerend_calendar: endTime,
        province_calendar: values.province_calendar,
        maximummembers_calendar: values.maximummembers_calendar,
        detailprovince_calendar: values.detailprovince_calendar,
        date_calendar: formattedDate,
        title_calendar: values.title_calendar,
        content_calendar: [],
        membersjoin_calendar: [],
        id_calendar: id,
      };
      console.log(newData);
      //check email đã tồn tại không
      // const userDoc = doc(db, "child_info", "ICCREATORY-" + "NE10");
      await setDoc(userDoc, newData);
      openNotificationWithIcon("success");
      setCreateForm(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      openNotificationWithIcon("warning");
      throw error; // Ném ra lỗi nếu có lỗi xảy ra
    }
  };

  const validateNumber = (rule, value, callback) => {
    const onlyNumbersRegex = /^[0-9]+$/; // Biểu thức chính quy chỉ cho phép các số

    if (!value || onlyNumbersRegex.test(value)) {
      // Nếu giá trị rỗng hoặc là số, trả về undefined (không có lỗi)
      callback();
    } else {
      // Nếu không phải là số, trả về thông báo lỗi
      callback("Please input a valid Max of Members!");
    }
  };
  const onStartTimeChange = (time) => {
    setStartTime(time);
  };
  const onEndTimeChange = (time) => {
    setEndTime(time);
  };
  return (
    <div>
      {contextHolder}
      <Modal
        title="Create New Visitation "
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
            label="Title"
            name="title_calendar"
            rules={[
              {
                required: true,
                message: "Please input Title!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Volunteer leader"
            name="volunteer_calendar"
            rules={[
              {
                required: true,
                message: "Please select volunteer name!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Max members"
            name="maximummembers_calendar"
            rules={[
              {
                required: true,
                message: "Please input max of members!",
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
            name="province_calendar"
            rules={[
              {
                required: true,
                message: "Please select province!",
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
            label="Detail Address"
            name="detailprovince_calendar"
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
            label="Date"
            name="date_calendar"
            rules={[
              {
                required: true,
                message: "Please input Date start!",
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="timerstart_calendar"
            rules={[
              {
                required: false,
                message: "Please input Start time!",
              },
            ]}
          >
            <TimePicker
              defaultValue={dayjs("07:00", format)}
              format={format}
              onChange={onStartTimeChange}
            />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="timerend_calendar"
            rules={[
              {
                required: false,
                message: "Please input End time!",
              },
            ]}
          >
            <TimePicker
              defaultValue={dayjs("17:00", format)}
              format={format}
              onChange={onEndTimeChange}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateCalendar;
