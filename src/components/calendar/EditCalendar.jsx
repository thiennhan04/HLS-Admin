import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { provinceData } from "../appConstants/constants";
import { db, storage } from "../../firebase-config";
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
const EditCalendar = ({
  isvisible,
  setEditForm,
  calendarSelect,
  setSelectedRecord,
  calendarDate,
  setCalendarDate,
  startTimeCalendar,
  endTimeCalendar,
  handleFCancel,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const format = "HH:mm";
  const options = [];
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY", "DD-MM-YYYY", "DD-MM-YY"];
  const dateFormat = "DD/MM/YYYY";
  const [key, setKey] = useState(0); // Add key state
  const [dateCalendar, setDateCalendar] = useState("");
  const startTimeDefault = dayjs(startTimeCalendar, "HH:mm");
  const endTimeDefault = dayjs(endTimeCalendar, "HH:mm");
  // calendarSelect.date_calendar
  // console.log("tab edit");
  // console.log(startTimeCalendar);
  // console.log(endTimeCalendar);

  useEffect(() => {
    setKey(key + 1);
  }, [dateCalendar, startTime, endTime]);
  useEffect(() => {
    if (calendarSelect) {
      setDateCalendar(calendarDate);
      setStartTime(startTimeCalendar);
      setEndTime(endTimeCalendar);
      form.setFieldsValue(calendarSelect);
    }
  }, [calendarSelect, form]);
  const handleCancel = () => {
    setEditForm(false);
    setCalendarDate("");
    setSelectedRecord(null);
    setStartTime(null);
    setEndTime(null);
    form.resetFields();
    handleFCancel();
  };
  const onStartTimeChange = (time, timeString) => {
    setStartTime(timeString);
  };
  const onEndTimeChange = (time, timeString2) => {
    setEndTime(timeString2);
  };
  provinceData.forEach((item) => {
    options.push({
      value: item,
      label: item,
    });
  });
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
  const openNotificationWithIcon = (type, message) => {
    const messages = {
      success: {
        message: message || "Success: Edit Visitation Information",
        description: "Visitation has been edited successfully!",
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

  const handleOk = async (value) => {
    const values = await form.validateFields();
    let userDoc;
    try {
      let id;
      let userSnapshot;
      //chuyển đổi ngày giờ về đúng định dạng
      const selectedDate = new Date(dateCalendar);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      // Biến đổi thành chuỗi định dạng "YYYY-MM-DD"
      const formattedDate = `${month}/${day}/${year}`;

      // //tạo đối tượng calendar để lưu
      const newData = {
        volunteer_calendar: values.volunteer_calendar,
        timerstart_calendar: startTime,
        timerend_calendar: endTime,
        province_calendar: values.province_calendar,
        maximummembers_calendar: values.maximummembers_calendar,
        detailprovince_calendar: values.detailprovince_calendar,
        date_calendar: formattedDate,
        title_calendar: values.title_calendar,
      };

      // //check email đã tồn tại không
      const userDoc = doc(
        db,
        "calendar_info",
        "ICCREATORY-" + calendarSelect.id_calendar
      );
      await updateDoc(userDoc, newData);
      openNotificationWithIcon("success");
      setEditForm(false);
      form.resetFields();
      setSelectedRecord(null);
      setStartTime(null);
      setEndTime(null);
    } catch (error) {
      openNotificationWithIcon("warning");
      throw error; // Ném ra lỗi nếu có lỗi xảy ra
    }
  };
  // Hàm so sánh thời gian
  const compareTimes = () => {
    const startTimeDate = dayjs(`${startTime}:00`, "HH:mm:ss");
    const endTimeDate = dayjs(`${endTime}:00`, "HH:mm:ss");
    const formatStartTime = startTimeDate.format("HH:mm");
    const formatEndTime = endTimeDate.format("HH:mm");
    //mục đích tạo ra startime date dùng để đưa giờ về đúng định dạng với JS mới dùng được hàm format
    const [hour1, minute1] = formatStartTime.split(":").map(Number);
    const [hour2, minute2] = formatEndTime.split(":").map(Number);
    const time1InMinutes = hour1 * 60 + minute1;
    const time2InMinutes = hour2 * 60 + minute2;
    return time1InMinutes <= time2InMinutes;
  };
  const validateDateNull = (rule, value, callback) => {
    if (!value || !dateCalendar) {
      callback(); // Không có lỗi, gọi callback mà không truyền tham số
    } else {
      callback("Please select Date!"); // Truyền lỗi vào callback nếu không hợp lệ
    }
  };
  const validateStartTimeRange = (rule, value, callback) => {
    if (!value || !startTime || compareTimes()) {
      callback(); // Không có lỗi, gọi callback mà không truyền tham số
    } else {
      callback("Start time must be before end time"); // Truyền lỗi vào callback nếu không hợp lệ
    }
  };
  const validateEndTimeRange = (rule, value, callback) => {
    if (!value || !endTime || compareTimes()) {
      callback(); // Không có lỗi, gọi callback mà không truyền tham số
    } else {
      callback("End time must be after start time"); // Truyền lỗi vào callback nếu không hợp lệ
    }
  };
  return (
    <div>
      {contextHolder}
      <Modal
        title="Edit New Visitation "
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
          initialValues={calendarSelect || {}}
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
            name="datecalendar"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && !dateCalendar) {
                    return Promise.reject("Please select a date");
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              key={key}
              defaultValue={dayjs(dateCalendar, dateFormat)}
              format={dateFormatList[0]}
              onChange={(date) => {
                setDateCalendar(date);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="starttime"
            rules={[
              { validator: validateStartTimeRange },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && !startTime) {
                    return Promise.reject("Please select start time");
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TimePicker
              key={key}
              defaultValue={dayjs(startTimeCalendar, format)}
              format={format}
              onChange={onStartTimeChange}
            />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endtime"
            rules={[
              { validator: validateEndTimeRange },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value && !endTime) {
                    return Promise.reject("Please select end time");
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TimePicker
              key={key}
              defaultValue={dayjs(endTimeDefault, format)}
              format={format}
              onChange={onEndTimeChange}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditCalendar;
