import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space } from "antd";
import type { FireworksItem } from "../types";

interface TableColumnsProps {
  onEdit: (record: FireworksItem) => void;
  onDelete: (id: number) => void;
  onPreview: (record: FireworksItem) => void;
}

export const createTableColumns = ({
  onEdit,
  onDelete,
  onPreview,
}: TableColumnsProps) => [
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
            onClick={() => onPreview(record)}
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
          onClick={() => onEdit(record)}
        >
          编辑
        </Button>
        <Popconfirm
          title="确定要删除这条记录吗？"
          onConfirm={() => onDelete(record.id)}
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
