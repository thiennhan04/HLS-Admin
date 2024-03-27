import React, { useState, useEffect } from "react";
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
  TreeSelect,
} from "antd";
const { RangePicker } = DatePicker;
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
      console.log(accountSelect);
      form.setFieldsValue(accountSelect);
    }
  }, [accountSelect, form]);
  const handleCancel = () => {
    // setIsModalVisible(false);
    setEditForm(false);
    setSelectedRecord(null);
    handleFCancel();
  };

  const handleOk = () => {
    // setIsModalVisible(false);
    setEditForm(false);
    setSelectedRecord(null);
  };

  return (
    <Modal
      title="Edit Account Information"
      visible={isvisible}
      onCancel={handleCancel}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            form.resetFields();
            handleCancel();
          }}
        >
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
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
              required: true,
              message: "Please input!",
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
              required: true,
              message: "Please input!",
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
              required: true,
              message: "Please input!",
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
              required: false,
              message: "Please input!",
            },
          ]}
        >
          <Cascader />
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
          <TreeSelect />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAccountForm;
