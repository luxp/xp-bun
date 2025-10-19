import { uploadFile } from "@/api/call";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Upload } from "antd";
import { useState } from "react";
import type { FireworksFormData, FireworksItem } from "../types";

interface EditModalProps {
  visible: boolean;
  editingItem: FireworksItem | null;
  onOk: (values: FireworksFormData) => void;
  onCancel: () => void;
}

export default function EditModal({
  visible,
  editingItem,
  onOk,
  onCancel,
}: EditModalProps) {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

  // 处理保存
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("表单验证失败", error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setUploadedFile(null);
    onCancel();
  };

  return (
    <Modal
      title={editingItem ? "编辑 Fireworks" : "新增 Fireworks"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
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
            customRequest={(options) => handleFileUpload(options.file as File)}
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
  );
}
