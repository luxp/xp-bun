import { callApi } from "@/api/call";
import { PlusOutlined, RocketOutlined } from "@ant-design/icons";
import { Button, Card, message, Space, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import EditModal from "./components/EditModal";
import GenerateModal from "./components/GenerateModal";
import { createTableColumns } from "./components/TableColumns";
import VideoPreviewModal from "./components/VideoPreviewModal";
import type {
  FireworksFormData,
  FireworksItem,
  GenerateFormData,
} from "./types";

const { Title } = Typography;

export default function Fireworks() {
  const [data, setData] = useState<FireworksItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FireworksItem | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
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
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  // 保存数据
  const handleSave = async (values: FireworksFormData) => {
    try {
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
  };

  // 关闭生成烟花弹窗
  const closeGenerateModal = () => {
    setGenerateModalVisible(false);
  };

  // 生成烟花
  const handleGenerate = async (values: GenerateFormData) => {
    try {
      setGenerating(true);

      await callApi("fireworks/create", {
        prompt: values.prompt,
        aiModel: values.aiModel || "veo-2",
      });

      message.success("烟花生成任务已启动，请稍后查看结果");
      closeGenerateModal();
      loadData(current, pageSize);
    } catch (error: any) {
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

  // 创建表格列配置
  const columns = createTableColumns({
    onEdit: openModal,
    onDelete: handleDelete,
    onPreview: openVideoPreview,
  });

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

      {/* 新增/编辑模态框 */}
      <EditModal
        visible={modalVisible}
        editingItem={editingItem}
        onOk={handleSave}
        onCancel={closeModal}
      />

      {/* 生成烟花模态框 */}
      <GenerateModal
        visible={generateModalVisible}
        loading={generating}
        onOk={handleGenerate}
        onCancel={closeGenerateModal}
      />

      {/* 视频预览模态框 */}
      <VideoPreviewModal
        visible={previewModalVisible}
        videoUrl={previewVideoUrl}
        videoName={previewVideoName}
        onClose={closeVideoPreview}
      />
    </div>
  );
}
