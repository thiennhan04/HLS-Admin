import React, { useState, useEffect } from "react";
import { db } from "../../firebase-config";
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Modal,
  Input,
  notification,
  Select,
  TreeSelect,
} from "antd";

import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

const EditAccountForm = ({
  isvisible,
  setEditForm,
  accountSelect,
  setSelectedRecord,
  handleFCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (accountSelect) {
      console.log(accountSelect.email);
      form.setFieldsValue(accountSelect);
    }
  }, [accountSelect, form]);

  const handleCancel = () => {
    setEditForm(false);
    setSelectedRecord(null);
    handleFCancel();
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      error: {
        message: message || "Error: Update Account Failed",
        description: "Please try again!",
      },
      success: {
        message: message || "Success: Update Account Success",
        description: "Account has been Updated successfully!",
      },
      warning: {
        message: message || "Warning: Update Account Failed",
        description: "This email already exists. Please try again!",
      },
    };

    api[type]({
      message: messages[type].message,
      description: messages[type].description,
    });
  };
  const handleOk = async (value) => {
    const values = await form.validateFields();
    console.log(values);
    //lấy dữ liệu từ account từ firebase
    const userDoc = doc(
      db,
      "account_info",
      "ICCREATORY-" + accountSelect.email
    );
    const newDoc = doc(db, "account_info", "ICCREATORY-" + values.email);
    const userSnapshot = await getDoc(newDoc);
    // console.log(
    //   "email " + userSnapshot.data().account_user + " " + accountSelect.email
    // );
    if (
      userSnapshot.exists() &&
      userSnapshot.data().account_user !== accountSelect.email
    ) {
      // cảnh báo nếu tài khoản đó được update email trùng với tài khoản khác
      openNotificationWithIcon("warning");
    } else {
      // thực hiện login edit
      const bannedValue = values.status === "true";
      try {
        if (values.email !== accountSelect.email) {
          await deleteDoc(userDoc);
        }
        await setDoc(newDoc, {
          account_user: values.email,
          firstname_user: values.firstname,
          lastname_user: values.lastname,
          role_user: values.role,
          phone_user: values.phone,
          codebill_payment: accountSelect.codebill_payment,
          childadoptioncode_children: accountSelect.ccc,
          province_user: values.province,
          banned_user: bannedValue,
        });
        openNotificationWithIcon("success");
      } catch (error) {
        alert(error.message);
        openNotificationWithIcon("error");
      }

      setEditForm(false);
      setSelectedRecord(null);
    }
  };

  return (
    <div>
      {contextHolder}
      <Modal
        title="Edit Account Information"
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
          initialValues={accountSelect || {}}
          form={form}
        >
          <Form.Item
            label="Account email"
            name="email"
            rules={[
              {
                pattern: /^[\w.+\-]+@gmail\.com$/,
                message: "Please enter a valid email!",
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
                pattern: /^[0-9]{10,11}$/, // Biểu thức chính quy để kiểm tra số điện thoại có độ dài từ 10 đến 11 chữ số
                message: "Phone Number is invalid!",
              },
              {
                required: false,
                message: "Please input!",
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
                message: "Please select role!",
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
                message: "Please input!",
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

export default EditAccountForm;
