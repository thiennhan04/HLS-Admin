import React, { useState, useEffect } from "react";
import TabBar from "../../components/tabbar/TabBar";
import "./Home.css";
import LineChart from "../../components/home/LineChart";
import TableData from "../../components/home/TableData";
import dayjs from "dayjs";
import CanvasJSReact from "@canvasjs/react-charts";

import {
  Space,
  Table,
  Tag,
  Input,
  Button,
  Spin,
  notification,
  Switch,
  Modal,
} from "antd";
import { Routes, Route, useNavigate, Await } from "react-router-dom";
import {
  doc,
  orderBy,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase-config";
import {
  LikeOutlined,
  PartitionOutlined,
  ScheduleOutlined,
  TeamOutlined,
  HeartOutlined,
} from "@ant-design/icons";
const Home = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [totalFinancial, setTotalFinancial] = useState("0");
  const [loading, setLoading] = React.useState(false);
  const [totalVolunteers, setTotalVolunteers] = useState("0");
  const [totalDonnor, setTotalDonnor] = useState("0");
  const [totalChildren, setTotalChildren] = useState("0");
  const [totalVisitation, setTotalVisitation] = useState("0");
  const [topEmails, setTopEmails] = useState([]);
  const [topAccounts, setTopAccounts] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [months, setMonths] = useState([]);
  var CanvasJS = CanvasJSReact.CanvasJS;
  var CanvasJSChart = CanvasJSReact.CanvasJSChart;
  var countAuth = 0;

  const fetchTotalFinance = async () => {
    var sumFinancial = 0;
  };

  useEffect(() => {
    if (countAuth === 0) checkUserAuth();
    countAuth++;
    fetchFinancialData();
    fetchQuantGroup();
    fetchNewData();
    fetchTopDonors();
    fetchChartData();
    const intervalId = setInterval(() => {
      fetchFinancialData();
      fetchQuantGroup();
      fetchTopDonors();
      fetchNewData();
      fetchChartData();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

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

  const fetchChartData = async () => {
    try {
      // Fetch all documents from the financial_info collection
      const financialCollection = collection(db, "financial_info");
      const q = query(financialCollection, orderBy("financial_date", "desc"));
      const querySnapshot = await getDocs(q);

      // Use dayjs to parse DD MM YYYY format to a Date object
      const parseDate = (dateString) => {
        return dayjs(dateString, "DD MM YYYY").toDate();
      };

      const financialData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        financial_date: parseDate(doc.data().financial_date),
      }));

      if (financialData.length === 0) {
        return [];
      }

      // Find the latest date
      const latestDate = financialData[0].financial_date;

      // Create a Date object for 12 months before the latest date
      const startDate = new Date(latestDate);
      startDate.setMonth(startDate.getMonth() - 12);

      // Filter transactions within the last 12 months
      const filteredData = financialData.filter(
        (data) =>
          data.financial_date >= startDate && data.financial_date <= latestDate
      );

      // Initialize an array to store the monthly totals
      const monthlyTotals = Array(12).fill(0);

      const monthsArray = [];
      for (let i = 0; i < 12; i++) {
        const date = dayjs(latestDate).subtract(i, "month");
        const monthNumber = date.month() + 1; // Get month number (0-indexed, so add 1)
        monthsArray.push(monthNumber);
      }

      setMonths(monthsArray.reverse());

      const latestMonth = months[0];
      // console.log("Latest Month:", latestMonth);
      // console.log("Previous Months:", previousMonths);
      // Calculate the total transactions for each month
      filteredData.forEach((data) => {
        const monthIndex =
          latestDate.getMonth() -
          data.financial_date.getMonth() +
          (latestDate.getFullYear() - data.financial_date.getFullYear()) * 12;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyTotals[monthIndex] += parseFloat(data.financial_credit) || 0; // Adjust if needed for other fields
        }
      });

      await setMonthlyTotals(monthlyTotals.reverse()); // Reverse to get data in chronological order
    } catch (e) {
      console.log("Error fetching financial data: ", e);
      return [];
    }
  };
  // console.log(months[0]);
  const dataPoints = monthlyTotals.map((total, index) => {
    return {
      x: months[index], // Assuming months are numbered from 1 to 12
      y: total,
    };
  });
  const options = {
    height: 300,
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2",
    title: {
      text: "Monthly Financial Overview",
    },
    axisY: {
      title: "Total Transactions",
    },
    axisX: {
      interval: 1,
      minimum: 1,
      maximum: 12,
    },
    data: [
      {
        type: "line",
        toolTipContent: "Month {x}: {y}",
        dataPoints: dataPoints,
      },
    ],
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Account User",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Total Transaction",
      dataIndex: "total_transaction",
      key: "total_transaction",
    },
    {
      title: "Phone",
      dataIndex: "phone_user",
      key: "phone_user",
    },
    {
      title: "Province",
      dataIndex: "province_user",
      key: "province_user",
    },
    {
      title: "Role",
      dataIndex: "role_user",
      key: "role_user",
    },
  ];
  const fetchTopDonors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bill_info"));
      const transactions = querySnapshot.docs.map((bill) => ({
        account_user: bill.data().account_user,
      }));

      // Process data to count transactions per email
      const emailCount = transactions.reduce((acc, transaction) => {
        acc[transaction.account_user] =
          (acc[transaction.account_user] || 0) + 1;
        return acc;
      }, {});

      // Convert the object to an array and sort it
      const sortedEmailCount = Object.entries(emailCount)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Get top 5 emails

      setTopEmails(sortedEmailCount);

      // Fetch detailed info for each top email from account_info
      const detailedInfoPromises = sortedEmailCount.map(async (item) => {
        const accountDoc = await getDoc(
          doc(db, "account_info", "ICCREATORY-" + item.email)
        );

        if (accountDoc.exists()) {
          const accountData = accountDoc.data();
          return {
            email: item.email,
            name: accountData.lastname_user + " " + accountData.firstname_user,
            total_transaction: item.count,
            phone_user: accountData.phone_user,
            province_user: accountData.province_user,
            role_user: accountData.role_user,
          };
        } else {
          return { email: item.email, count: item.count };
        }
      });

      const detailedInfo = await Promise.all(detailedInfoPromises);
      console.log(detailedInfo);
      setTopAccounts(detailedInfo);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
    }
  };
  const fetchNewData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "createpost_info"));
      // console.log(querySnapshot);
      const res = [];
      querySnapshot.forEach((post) => {
        res.push({
          id_post: post.data().id_post,
          content_post: post.data().content_post,
          image_post: post.data().image_post,
          firstname_user: post.data().firstname_user,
          lastname_user: post.data().lastname_user,
          fullname_user:
            post.data().firstname_user + " " + post.data().lastname_user,
          daycreate_post: post.data().daycreate_post,
          daycreate_post_sort: dayjs(
            post.data().daycreate_post,
            "ddd, DD/MM/YYYY, HH:mm:ss"
          ).toDate(),
          account_user: post.data().account_user,
          city_post: post.data().city_post,
          is_approved: post.data().is_approved ? "true" : "false",
        });
      });
      // Sắp xếp kết quả theo trường daycreate_post
      res.sort((a, b) => b.daycreate_post_sort - a.daycreate_post_sort);
      setEvents(res);
    } catch (error) {
    } finally {
      setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
    }
  };
  const fetchQuantGroup = async () => {
    var sumVolunteers = 0;
    var sumDonors = 0;
    var sumChildren = 0;
    var sumVisitation = 0;

    const accountCollections = collection(db, "account_info");
    const visitationCollections = collection(db, "calendar_info");
    const childrenCollections = collection(db, "child_info");
    //đếm chuyến thăm
    try {
      const querySnapshot = await getDocs(visitationCollections);
      sumVisitation = querySnapshot.size;
    } catch (error) {
      console.error("Error counting visitatioon: ", error);
    }

    //đếm trẻ
    try {
      const querySnapshot = await getDocs(childrenCollections);
      sumChildren = querySnapshot.size;
    } catch (error) {
      console.error("Error counting children: ", error);
    }

    //đếm tình nguyện viên và người ủng hộ
    try {
      const querySnapshot = await getDocs(accountCollections);
      querySnapshot.forEach((row) => {
        if (row.data().role_user === "user") {
          sumDonors++;
        } else if (row.data().role_user === "volunteer") {
          sumVolunteers++;
        }
      });
    } catch (error) {
      console.error("Error counting user: ", error);
    }
    setTotalChildren(sumChildren);
    setTotalDonnor(sumDonors);
    setTotalVolunteers(sumVolunteers);
    setTotalVisitation(sumVisitation);
  };
  const fetchFinancialData = async () => {
    try {
      var sumCredit = 0;
      const financialCollection = collection(db, "financial_info");
      try {
        const querySnapshot = await getDocs(financialCollection);
        if (querySnapshot.empty) {
          console.log("No matching documents.");
          return [];
        }
        querySnapshot.forEach((row) => {
          if (row.data().financial_credit !== "")
            sumCredit += parseInt(
              row.data().financial_credit.replace(/,/g, ""),
              10
            );
        });
        setTotalFinancial(sumCredit.toLocaleString("en-US"));
      } catch (e) {}
    } catch (error) {
      console.log(" error financial " + error.message);
    }
  };

  return (
    <div className="home-container">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="home-body">
        {/* <h1 className="home-header">Dashboard Overview</h1> */}
        <div className="home-content">
          <div className="content-left">
            <div className="left-chart">
              <div className="line-chart">
                <CanvasJSChart options={options} />
              </div>
              {/* <LineChart /> */}
            </div>
            <div className="left-chart">
              <Spin spinning={loading}>
                <div className="table-data">
                  <Table columns={columns} dataSource={topAccounts} />
                </div>
              </Spin>
            </div>
          </div>
          <div className="content-right">
            <div className="total-finan">
              <h2 className="total-finan-header">Total Finances</h2>
              <div className="total-finan-body">
                <div className="finan-body-left">
                  <div className="finan-summary">{totalFinancial} VND</div>
                  <div className="finan-available">
                    <LikeOutlined className="final-like-icon" />
                    Available for distribution
                  </div>
                </div>
                <div className="finan-body-right">
                  {/* <PieChartOutlined className="right-icon" /> */}
                </div>
              </div>
            </div>
            <div className="list-total-quant">
              <div className="list-total-item">
                <div className="item-title">
                  <PartitionOutlined className="quant-icon" />
                  Volunteers
                </div>
                <div className="item-quant">{totalVolunteers}</div>
              </div>
              <div className="list-total-item">
                <div className="item-title">
                  <HeartOutlined className="quant-icon" />
                  Donors
                </div>
                <div className="item-quant">{totalDonnor}</div>
              </div>
              <div className="list-total-item">
                <div className="item-title">
                  <TeamOutlined className="quant-icon" />
                  Children
                </div>
                <div className="item-quant">{totalChildren}</div>
              </div>
              <div className="list-total-item">
                <div className="item-title">
                  <ScheduleOutlined className="quant-icon" />
                  Visitation
                </div>
                <div className="item-quant">{totalVisitation}</div>
              </div>
            </div>
            <div className="event-gr">
              <h2 className="event-gr-header">New Events</h2>
              <div className="list-event">
                {events.length > 0 ? (
                  events.map((event, index) => (
                    <div key={index} className="list-event-item">
                      <div className="event-item-avt">
                        <img
                          src={event.image_post}
                          alt=""
                          className="item-img"
                        />
                      </div>
                      <div className="event-item-des">
                        <div className="event-item-title">
                          {event.content_post}
                        </div>
                        <div className="item-author-gr">
                          <div className="item-author">
                            {event.fullname_user}
                          </div>
                          <div className="item-time">
                            {dayjs(event.daycreate_post_sort).format("hh:mm A")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-events">No events found</div> // Thông báo khi không có sự kiện nào
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
