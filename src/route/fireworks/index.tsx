import { callApi, uploadFile } from "@/api/call";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  RocketOutlined,
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
  videoPathNoWatermark: string | null;
  publicVideoPath: string | null;
  publicVideoPathNoWatermark: string | null;
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
  const [generating, setGenerating] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateForm] = Form.useForm();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [previewVideoName, setPreviewVideoName] = useState("");

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

  // 打开生成烟花弹窗
  const openGenerateModal = () => {
    setGenerateModalVisible(true);
    generateForm.resetFields();
  };

  // 关闭生成烟花弹窗
  const closeGenerateModal = () => {
    setGenerateModalVisible(false);
    generateForm.resetFields();
  };

  // 生成烟花
  const handleGenerate = async () => {
    try {
      const values = await generateForm.validateFields();
      setGenerating(true);

      const result = await callApi("fireworks/create", {
        prompt: values.prompt,
        aiModel: values.aiModel || "veo-2",
      });

      message.success("烟花生成任务已启动，请稍后查看结果");
      closeGenerateModal();
      loadData(current, pageSize);
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error("生成烟花失败");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  // 打开视频预览
  const openVideoPreview = (record: FireworksItem) => {
    const previewUrl =
      record.publicVideoPathNoWatermark || record.publicVideoPath;
    if (!previewUrl) {
      message.warning("视频路径为空");
      return;
    }

    const fileName =
      (record.videoPathNoWatermark || record.videoPath)?.split("/").pop() ||
      "video";

    setPreviewVideoUrl(previewUrl);
    setPreviewVideoName(fileName);
    setPreviewModalVisible(true);
  };

  // 关闭视频预览
  const closeVideoPreview = () => {
    setPreviewModalVisible(false);
    setPreviewVideoUrl("");
    setPreviewVideoName("");
  };

  // 下载视频
  const handleDownloadVideo = () => {
    if (!previewVideoUrl) return;

    const link = document.createElement("a");
    link.href = previewVideoUrl;
    link.download = previewVideoName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("开始下载视频");
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
      render: (text: string, record: FireworksItem) => {
        if (!text) return "-";

        return (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => openVideoPreview(record)}
              icon={<EyeOutlined />}
              style={{ padding: 0, height: "auto" }}
            >
              预览
            </Button>
            <span style={{ color: "#1890ff", cursor: "pointer" }} title={text}>
              {text.length > 30 ? `${text.substring(0, 30)}...` : text}
            </span>
          </Space>
        );
      },
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
          <Space>
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={openGenerateModal}
              loading={generating}
              disabled={generating}
            >
              生成烟花
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新增
            </Button>
          </Space>
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

      {/* 生成烟花弹窗 */}
      <Modal
        title="生成烟花"
        open={generateModalVisible}
        onOk={handleGenerate}
        onCancel={closeGenerateModal}
        confirmLoading={generating}
        width={600}
      >
        <Form
          form={generateForm}
          layout="vertical"
          initialValues={{
            prompt:
              "生成美丽的烟花视频，期望有多次的爆炸，注意烟花要和现实中的一样，不要看着像假的",
            aiModel: "veo-2",
          }}
        >
          <Form.Item
            label="提示词"
            name="prompt"
            rules={[{ required: true, message: "请输入提示词" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请描述您想要的烟花效果，例如：生成美丽的烟花视频，期望有多次的爆炸，注意烟花要和现实中的一样，不要看着像假的"
            />
          </Form.Item>

          <Form.Item
            label="AI模型"
            name="aiModel"
            rules={[{ required: true, message: "请选择AI模型" }]}
          >
            <Input placeholder="请输入AI模型，如：veo-2, veo-3.1-fast" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 视频预览弹窗 */}
      <Modal
        title={`视频预览 - ${previewVideoName}`}
        open={previewModalVisible}
        onCancel={closeVideoPreview}
        width={800}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              handleDownloadVideo();
            }}
          >
            下载视频
          </Button>,
          <Button key="close" onClick={closeVideoPreview}>
            关闭
          </Button>,
        ]}
      >
        {previewVideoUrl && (
          <div style={{ textAlign: "center" }}>
            <video
              controls
              key={previewVideoUrl}
              style={{ width: "100%", maxHeight: "500px" }}
              preload="metadata"
            >
              <source src={previewVideoUrl} type="video/mp4" />
              您的浏览器不支持视频播放。
            </video>
            <div style={{ marginTop: "16px", color: "#666" }}>
              <p>视频文件: {previewVideoName}</p>
              <p>
                预览地址:{" "}
                <a
                  href={previewVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {previewVideoUrl}
                </a>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
