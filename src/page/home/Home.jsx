import React from "react";
import TabBar from "../../components/tabbar/TabBar";
import { useState } from "react";
import "./Home.css";
import LineChart from "../../components/home/LineChart";
import TableData from "../../components/home/TableData";
import {
  LikeOutlined,
  PartitionOutlined,
  ScheduleOutlined,
  TeamOutlined,
  HeartOutlined,
} from "@ant-design/icons";
const Home = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  return (
    <div className="home-container">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="home-body">
        {/* <h1 className="home-header">Dashboard Overview</h1> */}
        <div className="home-content">
          <div className="content-left">
            <div className="left-chart">
              <LineChart />
            </div>
            <div className="left-chart">
              <TableData />
            </div>
          </div>
          <div className="content-right">
            <div className="total-finan">
              <h2 className="total-finan-header">Total Finances</h2>
              <div className="total-finan-body">
                <div className="finan-body-left">
                  <div className="finan-summary">14.000.000.000 VND</div>
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
                <div className="item-quant">12</div>
              </div>
              <div className="list-total-item">
                <div className="item-title">
                  <HeartOutlined className="quant-icon" />
                  Donors
                </div>
                <div className="item-quant">40</div>
              </div>
              <div className="list-total-item">
                <div className="item-title">
                  <TeamOutlined className="quant-icon" />
                  Children
                </div>
                <div className="item-quant">17</div>
              </div>
              <div className="list-total-item">
                <div className="item-title">
                  <ScheduleOutlined className="quant-icon" />
                  Visitation
                </div>
                <div className="item-quant">19</div>
              </div>
            </div>
            <div className="event-gr">
              <h2 className="event-gr-header">New Events</h2>
              <div className="list-event">
                <div className="list-event-item">
                  <div className="event-item-avt">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/post%2Fpost_avt_01.jpg?alt=media&token=4cf03d49-f4da-4cdb-ad02-b8f9b091d443"
                      alt=""
                      className="item-img"
                    />
                  </div>
                  <div className="event-item-des">
                    <div className="event-item-title">
                      CẢM NHẬN CỦA THẦY CÔ KHI CÓ BẾP GAS CÔNG NGHIỆP
                    </div>
                    <div className="item-author-gr">
                      <div className="item-author">Minh Duc</div>
                      <div className="item-time">05:00 AM</div>
                    </div>
                  </div>
                </div>

                <div className="list-event-item">
                  <div className="event-item-avt">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/post%2Fpost_avt_01.jpg?alt=media&token=4cf03d49-f4da-4cdb-ad02-b8f9b091d443"
                      alt=""
                      className="item-img"
                    />
                  </div>
                  <div className="event-item-des">
                    <div className="event-item-title">
                      CẢM NHẬN CỦA THẦY CÔ KHI CÓ BẾP GAS CÔNG NGHIỆP
                    </div>
                    <div className="item-author-gr">
                      <div className="item-author">Minh Duc</div>
                      <div className="item-time">05:00 AM</div>
                    </div>
                  </div>
                </div>

                <div className="list-event-item">
                  <div className="event-item-avt">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/post%2Fpost_avt_01.jpg?alt=media&token=4cf03d49-f4da-4cdb-ad02-b8f9b091d443"
                      alt=""
                      className="item-img"
                    />
                  </div>
                  <div className="event-item-des">
                    <div className="event-item-title">
                      CẢM NHẬN CỦA THẦY CÔ KHI CÓ BẾP GAS CÔNG NGHIỆP
                    </div>
                    <div className="item-author-gr">
                      <div className="item-author">Minh Duc</div>
                      <div className="item-time">05:00 AM</div>
                    </div>
                  </div>
                </div>

                <div className="list-event-item">
                  <div className="event-item-avt">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/post%2Fpost_avt_01.jpg?alt=media&token=4cf03d49-f4da-4cdb-ad02-b8f9b091d443"
                      alt=""
                      className="item-img"
                    />
                  </div>
                  <div className="event-item-des">
                    <div className="event-item-title">
                      CẢM NHẬN CỦA THẦY CÔ KHI CÓ BẾP GAS CÔNG NGHIỆP
                    </div>
                    <div className="item-author-gr">
                      <div className="item-author">Minh Duc</div>
                      <div className="item-time">05:00 AM</div>
                    </div>
                  </div>
                </div>

                <div className="list-event-item">
                  <div className="event-item-avt">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/hopelunchapp.appspot.com/o/post%2Fpost_avt_01.jpg?alt=media&token=4cf03d49-f4da-4cdb-ad02-b8f9b091d443"
                      alt=""
                      className="item-img"
                    />
                  </div>
                  <div className="event-item-des">
                    <div className="event-item-title">
                      CẢM NHẬN CỦA THẦY CÔ KHI CÓ BẾP GAS CÔNG NGHIỆP
                    </div>
                    <div className="item-author-gr">
                      <div className="item-author">Minh Duc</div>
                      <div className="item-time">05:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
