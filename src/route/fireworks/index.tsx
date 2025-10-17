import { callApi, uploadFile } from "@/api/call";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";

const { Title } = Typography;

interface FireworksItem {
  id: number;
  prompt: string | null;
  aiModel: string | null;
  videoPath: string | null;
  createAt: string;
}

export default function Fireworks() {
  const [data, setData] = useState<FireworksItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FireworksItem | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 加载数据
  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const result = await callApi("fireworks/list", {
        page,
        pageSize: size,
      });
      setData(result.data);
      setTotal(result.total);
      setCurrent(page);
      setPageSize(size);
    } catch (error) {
      message.error("加载数据失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    loadData(pagination.current, pagination.pageSize);
  };

  // 打开新增/编辑模态框
  const openModal = (item?: FireworksItem) => {
    setEditingItem(item || null);
    setModalVisible(true);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
    setUploadedFile(null);
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setUploadedFile(file);
      form.setFieldValue("videoPath", result.filePath);
      message.success("文件上传成功");
      return false; // 阻止默认上传行为
    } catch (error) {
      message.error("文件上传失败");
      console.error(error);
      return false;
    } finally {
      setUploading(false);
    }
  };

  // 保存数据
  const handleSave = async () => {
    console.log(form.getFieldsValue());
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // 更新
        await callApi("fireworks/update", {
          id: editingItem.id,
          ...values,
        });
        message.success("更新成功");
      } else {
        // 新增
        await callApi("fireworks/save", values);
        message.success("添加成功");
      }

      closeModal();
      loadData(current, pageSize);
    } catch (error) {
      message.error("保存失败");
      console.error(error);
    }
  };

  // 删除数据
  const handleDelete = async (id: number) => {
    try {
      await callApi("fireworks/delete", { id });
      message.success("删除成功");
      loadData(current, pageSize);
    } catch (error) {
      message.error("删除失败");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "提示词",
      dataIndex: "prompt",
      key: "prompt",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "AI模型",
      dataIndex: "aiModel",
      key: "aiModel",
      render: (text: string) => text || "-",
    },
    {
      title: "视频路径",
      dataIndex: "videoPath",
      key: "videoPath",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "创建时间",
      dataIndex: "createAt",
      key: "createAt",
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: FireworksItem) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Fireworks 管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            新增
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingItem ? "编辑 Fireworks" : "新增 Fireworks"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={closeModal}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            prompt: "",
            aiModel: "",
            videoPath: "",
          }}
        >
          <Form.Item
            label="提示词"
            name="prompt"
            rules={[{ required: true, message: "请输入提示词" }]}
          >
            <Input.TextArea rows={3} placeholder="请输入提示词" />
          </Form.Item>

          <Form.Item
            label="AI模型"
            name="aiModel"
            rules={[{ required: true, message: "请输入AI模型" }]}
          >
            <Input placeholder="请输入AI模型" />
          </Form.Item>

          <Form.Item
            label="视频文件"
            name="videoPath"
            rules={[{ required: true, message: "请上传视频文件" }]}
          >
            <Upload
              customRequest={(options) =>
                handleFileUpload(options.file as File)
              }
              showUploadList={false}
              accept="video/*"
              disabled={uploading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
                disabled={uploading}
              >
                {uploadedFile ? uploadedFile.name : "选择视频文件"}
              </Button>
            </Upload>
            {uploadedFile && (
              <div style={{ marginTop: 8, color: "#52c41a" }}>
                已上传: {uploadedFile.name}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
