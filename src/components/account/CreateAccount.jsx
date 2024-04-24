import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
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

const CreateAccount = ({ isvisible, setCreateForm, handleFCancel }) => {
  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Create Account",
        description: "Account has been created successfully!",
      },
      warning: {
        message: message || "Error: Create Account Failed",
        description: "This email already exists!",
      },
      error: {
        message: message || "Error: Create Account Failed",
        description: "",
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
    try {
      const bannedValue = values.status === "true";
      const newData = {
        account_user: values.email,
        firstname_user: values.firstname,
        lastname_user: values.lastname,
        role_user: values.role,
        childadoptioncode_children: "",
        phone_user: values.phone,
        province_user: values.province,
        banned_user: bannedValue,
      };

      //check email đã tồn tại không
      const userDoc = doc(db, "account_info", "ICCREATORY-" + values.email);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        openNotificationWithIcon("error");
      } else {
        // Thêm dữ liệu vào collection "account_info"
        // const userDoc = doc(db, "account_info", "ICCREATORY-" + values.email);
        // const docRef = await addDoc(collection(db, "account_info"), newData);
        await setDoc(userDoc, newData);
        openNotificationWithIcon("success");
        setCreateForm(false);
      }
    } catch (error) {
      openNotificationWithIcon("failed");
      throw error; // Ném ra lỗi nếu có lỗi xảy ra
    }
  };

  return (
    <div>
      {contextHolder}
      <Modal
        title="Create New Account "
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
            label="Account email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your E-mail!",
              },
              {
                pattern:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="firstname"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    // return Promise.reject("Please input your First Name!");
                  } else if (value.length < 2 || value.length > 50) {
                    return Promise.reject(
                      "First Name must be between 2 and 50 characters long"
                    );
                  }
                  return Promise.resolve();
                },
              },
              {
                required: true,
                message: "Please input First Name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastname"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    // return Promise.reject("Please input your First Name!");
                  } else if (value.length < 2 || value.length > 50) {
                    return Promise.reject(
                      "Last Name must be between 2 and 50 characters long"
                    );
                  }
                  return Promise.resolve();
                },
              },
              {
                required: true,
                message: "Please input Last Name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please input Phone Number!",
              },
              {
                pattern: /^[0-9]{10,11}$/, // Biểu thức chính quy để kiểm tra số điện thoại có độ dài từ 10 đến 11 chữ số
                message: "Phone Number is invalid!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Province"
            name="province"
            rules={[
              {
                required: true,
                message: "Please input Province!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role Account"
            name="role"
            rules={[
              {
                required: true,
                message: "Please select Role!",
              },
            ]}
          >
            <Select placeholder="select account role">
              <Option value="user">Donor</Option>
              <Option value="volunteer">Volunteer</Option>
            </Select>
          </Form.Item>
          <Form.Item
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
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateAccount;
