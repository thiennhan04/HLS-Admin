import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase-config";
import { PlusOutlined } from "@ant-design/icons";
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
  ref,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
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

const EditNews = ({
  isvisible,
  setEditForm,
  postSelect,
  setSelectedRecord,
  handleFCancel,
}) => {
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState();
  const [fileList, setFileList] = useState([]);
  const [isChangeImg, setIsChangeImg] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  useEffect(() => {
    if (postSelect) {
      // console.log(childBirthDate + " " + childSelect.dateofbirth_children);
      form.setFieldsValue(postSelect);
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: postSelect.image_post,
        },
      ]);
    }
  }, [postSelect, form]);

  const handleCancel = () => {
    // setIsModalVisible(false);
    setEditForm(false);
    setSelectedRecord(null);
    handleFCancel();
  };
  const [api, contextHolder] = notification.useNotification();

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
    setIsChangeImg(true);

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
  const handleOk = async (post) => {
    const values = await form.validateFields();
    const postDoc = doc(
      db,
      "createpost_info",
      "ICCREATORY-" + postSelect.id_post
    );

    try {
      var downloadURL = "";
      const bannedValue = values.is_approved === "true";
      if (isChangeImg) {
        //chuyển ảnh về dạng blob của firebase rồi lưu lên storage
        const storageRef = ref(storage, `/files/${fileList[0].name}`);
        await uploadBytesResumable(storageRef, fileList[0].blob);
        downloadURL = await getDownloadURL(storageRef);
      }
      await updateDoc(postDoc, {
        image_post: isChangeImg ? downloadURL : values.image_post,
        account_user: values.account_user,
        city_post: values.city_post,
        daycreate_post: values.daycreate_post,
        firstname_user: values.firstname_user,
        lastname_user: values.lastname_user,
        content_post: values.content_post,
        is_approved: bannedValue,
      });
      openNotificationWithIcon("success");
      setEditForm(false);
      setSelectedRecord(null);
      setIsChangeImg(false);
    } catch (e) {
      openNotificationWithIcon("error");
      console.log(e.message);
    }
  };

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
          initialValues={postSelect || {}}
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
            label="Create Day"
            name="daycreate_post"
            rules={[
              {
                required: false,
                message: "Please input date!",
              },
            ]}
          >
            <Input disabled />
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

export default EditNews;
