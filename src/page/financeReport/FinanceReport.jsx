import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Spin,
  Button,
  message,
  Upload,
  Select,
  DatePicker,
} from "antd";
import TabBar from "../../components/tabbar/TabBar";
import { Routes, Route, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  doc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase-config";
import "./FinanceReport.css";
import * as XLSX from "xlsx";
import {
  DollarOutlined,
  UploadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const FinanceReport = () => {
  const [activeTab, setActiveTab] = useState("Financial Report");
  const [loading, setLoading] = React.useState(false);
  const [fileList, setFileList] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  const dateFormat = "DD/MM/YYYY";
  const data = [];
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0"); // Lấy ngày và thêm số 0 ở đầu nếu cần
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Lấy tháng và thêm số 0 ở đầu nếu cần
  const year = currentDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  const previousMonthDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    currentDate.getDate()
  );
  const preDay = previousMonthDate.getDate().toString().padStart(2, "0"); // Lấy ngày và thêm số 0 ở đầu nếu cần
  const preMonth = (previousMonthDate.getMonth() + 1)
    .toString()
    .padStart(2, "0"); // Lấy tháng và thêm số 0 ở đầu nếu cần
  const preYear = previousMonthDate.getFullYear();
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const formattedPreviousMonthDate = `${preDay}/${preMonth}/${preYear}`;
  const [totalCredit, setTotalCredit] = useState("0");
  const [totalDebit, setTotalDebit] = useState("0");
  const [totalFinancial, setTotalFinancial] = useState("0");
  const [totalSpending, setTotalSpending] = useState("0");
  const [totalTransactions, setTotalTransactions] = useState("0");
  const [dates, setDates] = useState([
    dayjs(formattedPreviousMonthDate, dateFormat),
    dayjs(formattedDate, dateFormat),
  ]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  var countAuth = 0;
  const fixedColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: "10%",
      fixed: true,
    },
    {
      title: "Doc No",
      dataIndex: "financial_no",
      key: "financial_no",
      width: "12%",
    },
    {
      title: "Date",
      dataIndex: "financial_date",
      key: "financial_date",
      width: "12%",
    },
    {
      title: "Debit",
      dataIndex: "financial_debit",
      key: "financial_debit",
      width: "12%",
    },
    {
      title: "Credit",
      dataIndex: "financial_credit",
      key: "financial_credit",
      width: "12%",
    },
    {
      title: "Balance",
      dataIndex: "financial_balance",
      key: "financial_balance",
      width: "16%",
    },
    {
      title: "Detail",
      dataIndex: "financial_detail",
      key: "financial_detail",
    },
  ];
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setFinancialData([]);
    }
  };

  const checkUserAuth = () => {
    const user = auth.currentUser;
    setLoading(true);
    if (user) {
      // Người dùng đã đăng nhập
      console.log("User is logged in");
    } else {
      navigate("/");
    }
    setLoading(false);
  };
  useEffect(() => {
    if (countAuth === 0) checkUserAuth();
    countAuth++;
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [startDateFilter, endDateFilter]);
  const convertDateToDMY = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}${month}${day}`;
  };

  const fetchData = async () => {
    try {
      var stt = 0;
      var start;
      var end;
      var sumDebit = 0;
      var sumCredit = 0;
      var sumSpending = 0;
      var sumFinancial = 0;
      var sumTransactions = 0;
      if (startDateFilter !== "") start = convertDateToDMY(startDateFilter);
      if (endDateFilter !== "") end = convertDateToDMY(endDateFilter);

      const res = [];
      const financialCollection = collection(db, "financial_info");
      try {
        const querySnapshot = await getDocs(financialCollection);
        if (querySnapshot.empty) {
          console.log("No matching documents.");
          return [];
        }
        var stt = 0;
        console.log("fetch");

        querySnapshot.forEach((row) => {
          const data = row.data();
          stt++;
          sumTransactions++;
          const financialDate = convertDateToDMY(data.financial_date);
          if (row.data().financial_debit !== "")
            sumFinancial += parseInt(
              row.data().financial_debit.replace(/,/g, ""),
              10
            );
          if (row.data().financial_credit !== "")
            sumSpending += parseInt(
              row.data().financial_credit.replace(/,/g, ""),
              10
            );

          if (startDateFilter !== "" && endDateFilter !== "") {
            if (financialDate >= start && financialDate <= end) {
              res.push({
                stt: stt,

                financial_no: row.data().financial_no,
                financial_date: row.data().financial_date,
                financial_debit: row.data().financial_debit,
                financial_credit: row.data().financial_credit,
                financial_balance: row.data().financial_balance,
                financial_detail: row.data().financial_detail,
              });
              if (row.data().financial_debit !== "")
                sumDebit += parseInt(
                  row.data().financial_debit.replace(/,/g, ""),
                  10
                );
              if (row.data().financial_credit !== "")
                sumCredit += parseInt(
                  row.data().financial_credit.replace(/,/g, ""),
                  10
                );
            }
          } else if (startDateFilter === "" && endDateFilter === "") {
            if (row.data().financial_debit !== "")
              sumDebit += parseInt(
                row.data().financial_debit.replace(/,/g, ""),
                10
              );
            if (row.data().financial_credit !== "")
              sumCredit += parseInt(
                row.data().financial_credit.replace(/,/g, ""),
                10
              );
            res.push({
              stt: stt,
              financial_no: row.data().financial_no,
              financial_date: row.data().financial_date,
              financial_debit: row.data().financial_debit,
              financial_credit: row.data().financial_credit,
              financial_balance: row.data().financial_balance,
              financial_detail: row.data().financial_detail,
            });
          }
        });
        setTotalDebit(sumDebit.toLocaleString("en-US"));
        setTotalCredit(sumCredit.toLocaleString("en-US"));
        setTotalFinancial(sumFinancial.toLocaleString("en-US"));
        setTotalSpending(sumSpending.toLocaleString("en-US"));
        setTotalTransactions(sumTransactions);
        setFinancialData(res);
        // console.log("res");
        // console.log(res);
      } catch (e) {}

      // setFinancialData(res);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false); // Đặt loading thành   false sau khi dữ liệu đã được xử lý
    }
  };
  // const fetchData = async () => {
  //   console.log("in in");
  //   try {
  //     var stt = 0;
  //     const querySnapshot = await getDocs(collection(db, "financial_info"));
  //     const res = [];
  //     let latestMonth = 0; // Biến để lưu tháng mới nhất
  //     querySnapshot.forEach((row) => {
  //       stt++;
  //       res.push({
  //         stt: stt,
  //         financial_no: row.data().financial_no,
  //         financial_date: row.data().financial_date,
  //         financial_debit: row.data().financial_debit,
  //         financial_credit: row.data().financial_credit,
  //         financial_balance: row.data().financial_balance,
  //         financial_detail: row.data().financial_detail,
  //       });
  //     });
  //     setFinancialData(res);
  //   } catch (error) {
  //   } finally {
  //     setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
  //   }
  // };
  const convertDateToYMD = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}${month}${day}`;
  };
  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });
    setUploading(true);

    // Đọc dữ liệu từ file người dùng tải lên
    const file = fileList[0]; // Giả sử chỉ có một file được tải lên
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      // Xử lý dữ liệu JSON ở đây

      //check file có đúng format
      // Kiểm tra xem hàng đầu tiên có đúng định dạng không
      const firstRow = jsonData[0];
      const expectedHeader = [
        "STT\r\nNo.",
        "Ngày/\r\nTNX Date/ Số CT/ Doc No",
        "Số tiền ghi nợ/\r\nDebit",
        "Số tiền ghi có/\r\nCredit",
        "Số dư/\r\nBalance",
        "Nội dung chi tiết/\r\nTransactions in detail",
      ];
      const headerMatches = expectedHeader.every((column, index) => {
        return firstRow[index] === column;
      });

      if (!headerMatches) {
        message.error(
          "Invalid file format. Please make sure the first row contains the correct column headers."
        );
        setUploading(false);
        return;
      }
      var count = 0;
      try {
        jsonData.forEach(async (row, index) => {
          if (index === 0) {
            return;
          }
          const [dateString, idString] = row[1].split("\r\n");
          const date = dateString.trim().replace(/\s/g, "");
          const id = idString.trim().replace(/\s/g, "");
          // console.log(id.trim());
          const financialData = {
            financial_no: id,
            financial_date: date,
            financial_debit: row[2],
            financial_credit: row[3],
            financial_balance: row[4],
            financial_detail: row[5],
          };

          // // Thêm dữ liệu vào Firestore
          const finanDoc = doc(db, "financial_info", "ICCREATORY-" + id);
          await setDoc(finanDoc, financialData);
        });
        message.success("Upload successfully.");
        setUploading(false);
        setFileList([]);
      } catch (e) {
        message.error("Error reading file.");
        setUploading(false);
        setFileList([]);
      }
    };
    reader.onerror = () => {
      message.error("Error reading file.");
      setUploading(false);
    };
    reader.readAsArrayBuffer(file); // Đọc file dưới dạng ArrayBuffer
  };
  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };
  const handleDateChange = (dates) => {
    setDates(dates);
  };
  const handleFilter = () => {
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;
      setStartDateFilter(startDate.format(dateFormat));
      setEndDateFilter(endDate.format(dateFormat));
      // console.log("Start Date:", startDateFilter);
      // console.log("End Date:", endDateFilter);
    } else {
      setStartDateFilter("");
      setEndDateFilter("");
    }
  };

  return (
    <div class="finance-container">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="finance-body">
        <div className="account-header-gr">
          <h1 className="account-header">Financial Report</h1>
        </div>
        <div className="finance-list-report">
          <div className="finance-item-report">
            <div className="finance-item-title">
              <DollarOutlined className="quant-icon" />
              Total finances
            </div>
            <div className="finance-item-quant">{totalFinancial}</div>
          </div>

          <div className="finance-item-report total-spend">
            <div className="finance-item-title">
              <DollarOutlined className="quant-icon" />
              Total Spending
            </div>
            <div className="finance-item-quant">{totalSpending}</div>
          </div>

          <div className="finance-item-report total-month">
            <div className="finance-item-title">
              <DollarOutlined className="quant-icon" />
              Total Transactions
            </div>
            <div className="finance-item-quant">{totalTransactions}</div>
          </div>
        </div>
        <div className="finance-content">
          <div className="content-option">
            <div className="finance-content-select">
              <RangePicker
                // defaultValue={[
                //   dayjs(formattedPreviousMonthDate, dateFormat),
                //   dayjs(formattedDate, dateFormat),
                // ]}
                format={dateFormat}
                onChange={handleDateChange}
              />
              <Button
                type="primary"
                icon={<FilterOutlined />}
                iconPosition="start"
                className="filter-btn"
                onClick={handleFilter}
              >
                Filter
              </Button>
            </div>
            <div className="finace-upload-group">
              <Upload
                {...props}
                disabled={fileList.length > 1}
                name="file"
                accept=".xls, .xlsx"
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
              <Button
                type="primary"
                onClick={handleUpload}
                className="upload-btn"
                disabled={fileList.length !== 1}
                maxCount={1}
                loading={uploading}
                style={{
                  marginTop: 16,
                }}
              >
                {uploading ? "Uploading" : "Start Upload"}
              </Button>
            </div>
          </div>

          <div className="finance-table-data">
            <Spin spinning={loading}>
              <Table
                columns={fixedColumns}
                dataSource={financialData}
                onChange={handleTableChange}
                pagination={tableParams.pagination}
                scroll={{
                  x: 200,
                  y: 300,
                }}
                bordered
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={1}>
                        <b>Summary:</b>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        ${totalDebit}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        ${totalCredit}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
