import React, { useState, useEffect } from "react";
import TabBar from "../../components/tabbar/TabBar";
import { db } from "../../firebase-config";
import "./BillManagement.css";
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Space,
  Table,
  Tag,
  Input,
  Button,
  Switch,
  Spin,
  notification,
  Image,
  Modal,
} from "antd";

const { confirm } = Modal;
const { Search } = Input;

const BillManagement = () => {
  const [billData, setBillData] = useState([]);
  const [activeTab, setActiveTab] = useState("Bill Management");
  const [loading, setLoading] = React.useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      if (searchKey === "") {
        fetchData();
      } else {
        // onSearch(searchKey);
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [searchKey]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bill_info"));
      // console.log(querySnapshot);
      const res = [];
      querySnapshot.forEach((bill) => {
        res.push({
          id_payment: bill.data().id_payment,
          codebill_payment: bill.data().codebill_payment,
          account_user: bill.data().account_user,
          daycreate_payment: bill.data().daycreate_payment,
          childadopterprovince_payment:
            bill.data().childadopterprovince_payment,
          payerName:
            bill.data().firstname_user + " " + bill.data().lastname_user,
          image_payment: bill.data().image_payment,
          lastname_user: bill.data().province_user,
          statusbill_payment: bill.data().statusbill_payment ? "true" : "false",
        });
      });
      setBillData(res);
    } catch (error) {
    } finally {
      setLoading(false); // Đặt loading thành false sau khi dữ liệu đã được xử lý
    }
  };

  const handleAcceptBilll = async (record) => {
    confirm({
      title: "Do you want to accept this transaction bill?",
      icon: <ExclamationCircleOutlined />,
      content: "You won't be able to revert this",
      okText: "Yes",
      cancelText: "Cancel",
      async onOk() {
        const billDoc = doc(
          db,
          "bill_info",
          "ICCREATORY-" + record.codebill_payment
        );
        const accountDoc = doc(
          db,
          "account_info",
          "ICCREATORY-" + record.account_user
        );
        console.log(record.account_user);
        const q = query(
          collection(db, "child_info"),
          where("province_children", "==", record.childadopterprovince_payment),
          where("isadop_children", "==", false) // Thêm một điều kiện mới, ví dụ: tuổi lớn hơn hoặc bằng 18
        );
        const querySnapshot = await getDocs(q);
        const firstChildDoc = querySnapshot.docs[0];
        const accountSnap = await getDoc(accountDoc);
        //set trạng thái bill đã được chấp thuận
        const userSnapshot = await getDoc(billDoc);
        await updateDoc(billDoc, {
          statusbill_payment: record.statusbill_payment !== "true",
        });

        // set người nhận cho bé
        await updateDoc(firstChildDoc.ref, {
          childadopter_children: record.account_user,
          isadop_children: firstChildDoc.data().isadop_children !== "true",
        });
        // //set mã nhận nuôi cho người nhận
        var newChildAdopCode = "";
        if (accountSnap.data().childadoptioncode_children) {
          newChildAdopCode =
            accountSnap.data().childadoptioncode_children +
            "," +
            firstChildDoc.data().childadoptioncode_children;
        } else {
          newChildAdopCode = firstChildDoc.data().childadoptioncode_children;
        }

        await updateDoc(accountDoc, {
          childadoptioncode_children: newChildAdopCode,
        });
      },
      onCancel() {},
    });
  };
  const columns = [
    {
      title: "Id Payment",
      dataIndex: "id_payment",
      key: "id_payment",
    },
    {
      title: "Bill Code",
      dataIndex: "codebill_payment",
      key: "codebill_payment",
    },
    {
      title: "Creation Date",
      dataIndex: "daycreate_payment",
      key: "daycreate_payment",
    },
    {
      title: "Account Email",
      dataIndex: "account_user",
      key: "account_user",
    },
    {
      title: "Adopter Province ",
      dataIndex: "childadopterprovince_payment",
      key: "childadopterprovince_payment",
    },
    {
      title: "Payer Name",
      dataIndex: "payerName",
      key: "payerName",
    },
    {
      title: "Image Payment",
      dataIndex: "image_payment",
      render: (_, record) => (
        <Image.PreviewGroup items={[`${record.image_payment}`]}>
          <Image height={100} width={60} src={`${record.image_payment}`} />
        </Image.PreviewGroup>
      ),
    },

    {
      title: "Status Bill",
      key: "statusbill_payment",
      render: (_, record) => (
        <Space size="middle">
          <Switch
            disabled={record.statusbill_payment === "true"}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultValue={record.statusbill_payment === "true"}
            onChange={(checked) => handleAcceptBilll(record)}
            // onChange={handleAcceptBilll(record)}
          />

          {/* <Button type="primary" onClick={() => handleEditClick(record)}>
            Edit
          </Button> 
          <Button onClick={() => deleteUser(record)} type="primary" danger>
            Delete
          </Button> */}
        </Space>
      ),
    },
  ];
  const paginationConfig = {
    pageSize: 3,
    total: billData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    onChange: (page, pageSize) => {
      // Xử lý khi thay đổi trang
      console.log("Current page:", page);
      console.log("Page size:", pageSize);
    },
  };

  // const deleteUser = async (value) => {
  //   confirm({
  //     title: "Are you sure you want to delete this item?",
  //     icon: <ExclamationCircleOutlined />,
  //     content: "You won't be able to revert this",
  //     okText: "Yes",
  //     cancelText: "Cancel",
  //     async onOk() {
  //       try {
  //         const userDocRef = doc(
  //           db,
  //           "account_info",
  //           "ICCREATORY-" + value.email
  //         );
  //         // Xóa tài liệu
  //         await deleteDoc(userDocRef);
  //         //   openNotificationWithIcon("success");
  //       } catch (error) {
  //         //   openNotificationWithIcon("error");
  //       }
  //     },
  //     onCancel() {},
  //   });
  // };
  return (
    <div className="bill-container">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="bill-body">
        <div className="bill-header-gr">
          <h1 className="bill-header">Bill Management</h1>
          <Space direction="vertical" className="account-input">
            <Search
              className="input-search"
              placeholder="Enter Bill Code..."
              //   onSearch={}
              enterButton
              style={{
                width: 300,
                height: 100,
              }}
            />
          </Space>
        </div>
        <div className="bill-content">
          <div className="bill-table-data">
            {/* <Spin
            spinning={loading}
            > */}
            <Table
              columns={columns}
              dataSource={billData}
              // pagination={paginationConfig}
              style={{}}
            />
            {/* </Spin> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillManagement;
